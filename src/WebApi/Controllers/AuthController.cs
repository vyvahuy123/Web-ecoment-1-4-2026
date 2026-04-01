using Application.Features.Auth.Commands;
using Application.Features.Auth.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

/// <summary>
/// Authentication endpoints - Login, Register, Refresh Token, Logout
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Đăng nhập - trả về Access Token (15-60 phút) và Refresh Token (7 ngày)
    /// </summary>
    /// <remarks>
    /// React lưu accessToken vào memory (không localStorage),
    /// refreshToken vào httpOnly cookie để tránh XSS.
    /// </remarks>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        // Gán IP address để log
        var cmd = command with { IpAddress = GetIpAddress() };
        var result = await _mediator.Send(cmd, ct);

        // Gửi refreshToken qua httpOnly cookie - không thể đọc bởi JS
        SetRefreshTokenCookie(result.RefreshToken);

        // Chỉ trả accessToken trong body (React giữ trong memory)
        return Ok(new
        {
            result.AccessToken,
            result.AccessTokenExpiry,
            result.User
        });
    }

    /// <summary>
    /// Đăng ký tài khoản mới - tự động đăng nhập luôn
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        SetRefreshTokenCookie(result.RefreshToken);
        return StatusCode(StatusCodes.Status201Created, new
        {
            result.AccessToken,
            result.AccessTokenExpiry,
            result.User
        });
    }

    /// <summary>
    /// Lấy Access Token mới khi hết hạn - dùng Refresh Token từ cookie
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshAccessTokenRequest request,
        CancellationToken ct)
    {
        // Lấy refreshToken từ httpOnly cookie
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Refresh token không tồn tại." });

        var result = await _mediator.Send(
            new RefreshTokenCommand(request.AccessToken, refreshToken, GetIpAddress()), ct);

        // Rotate: cấp cookie mới
        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new
        {
            result.AccessToken,
            result.AccessTokenExpiry
        });
    }

    /// <summary>
    /// Đăng xuất - thu hồi Refresh Token, xóa cookie
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
            await _mediator.Send(new LogoutCommand(refreshToken, GetIpAddress()), ct);

        // Xóa cookie
        Response.Cookies.Delete("refreshToken");
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void SetRefreshTokenCookie(string token)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,           // JS không đọc được → chống XSS
            Secure   = true,           // Chỉ gửi qua HTTPS
            SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UtcNow.AddDays(7)
        });
    }

    private string GetIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
            return forwarded.ToString().Split(',')[0].Trim();
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

public record RefreshAccessTokenRequest(string AccessToken);
