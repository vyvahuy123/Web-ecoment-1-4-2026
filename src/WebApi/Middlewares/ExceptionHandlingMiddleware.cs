using System.Net;
using System.Text.Json;
using Application.Common.Exceptions;

namespace WebApi.Middlewares;

/// <summary>
/// Middleware bắt tất cả exception chưa được xử lý
/// và trả về JSON response chuẩn. Không để exception leak ra client.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.BadRequest,
                "Validation Error",
                ve.Errors),

            NotFoundException nfe => (
                HttpStatusCode.NotFound,
                "Not Found",
                (IDictionary<string, string[]>)new Dictionary<string, string[]>
                    { ["detail"] = new[] { nfe.Message } }),

            ConflictException ce => (
                HttpStatusCode.Conflict,
                "Conflict",
                (IDictionary<string, string[]>)new Dictionary<string, string[]>
                    { ["detail"] = new[] { ce.Message } }),

            Application.Common.Exceptions.UnauthorizedException ue => (
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                (IDictionary<string, string[]>)new Dictionary<string, string[]>
                    { ["detail"] = new[] { ue.Message } }),

            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                (IDictionary<string, string[]>)new Dictionary<string, string[]>
                    { ["detail"] = new[] { "Không có quyền truy cập." } }),

            _ => (
                HttpStatusCode.InternalServerError,
                "Server Error",
                (IDictionary<string, string[]>)new Dictionary<string, string[]>
                    { ["detail"] = new[] { "Lỗi hệ thống, vui lòng thử lại sau." } })
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception");

        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            title,
            errors,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
    }
}
