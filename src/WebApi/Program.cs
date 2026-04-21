using Application;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using WebApi.Middlewares;
using WebApi.Services;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("JWT Key not configured.");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
            opt.MapInboundClaims = false;
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                RoleClaimType = "role",
            };
            opt.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = ctx =>
                {
                    Console.WriteLine($"[JWT FAIL] {ctx.Exception.GetType().Name}: {ctx.Exception.Message}");
                    return Task.CompletedTask;
                },
                OnForbidden = ctx =>
                {
                    Console.WriteLine($"[JWT FORBIDDEN] User: {ctx.HttpContext.User.Identity?.Name}, Claims: {string.Join(", ", ctx.HttpContext.User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
                    return Task.CompletedTask;
                }
            };

        });

    builder.Services.AddAuthorization();

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Clean Architecture API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });
    builder.Services.AddScoped<Application.Interfaces.IVNPayService, Infrastructure.Services.VNPayService>();
    builder.Services.AddCors(opt => opt.AddPolicy("Default", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()));

    var app = builder.Build();

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Clean Architecture API v1");
            c.RoutePrefix = string.Empty;
        });
    }

    app.UseHttpsRedirection();
    app.UseCors("Default");
    app.UseStaticFiles();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var cfg = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var seedEmail = cfg["Seed:Email"];
        var seedPassword = cfg["Seed:Password"];
        var seedUsername = cfg["Seed:Username"];
        var seedFullName = cfg["Seed:FullName"];

        if (!string.IsNullOrEmpty(seedEmail) &&
            !await db.Users.AnyAsync(u => u.Email.Value == seedEmail))
        {
            var userResult = User.Create(
                seedUsername!,
                seedEmail!,
                BCrypt.Net.BCrypt.HashPassword(seedPassword),
                seedFullName);

            if (userResult.IsSuccess)
            {
                userResult.Value.AssignRole("Admin");
                db.Users.Add(userResult.Value);
                await db.SaveChangesAsync();
            }
        }
    }

    await AppDbContextSeed.SeedAsync(app.Services);
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}