using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Auth.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Application.Features.Auth.Commands;

// ── Command ───────────────────────────────────────────────────────────────────
public record LoginCommand(string Email, string Password, string? IpAddress = null)
    : IRequest<AuthResponse>;

// ── Validator ─────────────────────────────────────────────────────────────────
public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password không được để trống.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────
public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;
    private readonly IConfiguration _config;

    public LoginCommandHandler(
        IUnitOfWork uow,
        IPasswordHasher hasher,
        IJwtService jwt,
        IConfiguration config)
    {
        _uow    = uow;
        _hasher = hasher;
        _jwt    = jwt;
        _config = config;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken ct)
    {
        // 1. Tìm user theo email
        var user = await _uow.Users.GetByEmailAsync(request.Email, ct);

        // Dùng cùng 1 message cho cả "không tìm thấy" và "sai password"
        // → tránh lộ thông tin user có tồn tại hay không (Security best practice)
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");

        if (!user.IsActive)
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa.");

        // 2. Tạo Access Token
        var accessToken  = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        // 3. Tính expiry để trả về cho client
        var expiryMinutes = _config.GetValue<int>("Jwt:ExpiresInMinutes", 60);
        var expiry        = DateTime.UtcNow.AddMinutes(expiryMinutes);

        // 4. Tính expiry cho refresh token
        var refreshDays = _config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);

        // 5. Lưu Refresh Token vào DB
        var rt = RefreshToken.Create(
            user.Id, refreshToken,
            DateTime.UtcNow.AddDays(refreshDays),
            request.IpAddress);

        _uow.RefreshTokens.Add(rt);

        // 6. Ghi lại thời gian login
        user.RecordLogin();
        _uow.Users.Update(user);

        await _uow.SaveChangesAsync(ct);

        return new AuthResponse(
            AccessToken:       accessToken,
            RefreshToken:      refreshToken,
            AccessTokenExpiry: expiry,
            User: new UserInfo(
                user.Id, user.Username, user.Email.Value,
                user.FullName, user.Roles));
    }
}
