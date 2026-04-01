using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Auth.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Application.Features.Auth.Commands;

// ══════════════════════════════════════════════════════
// REFRESH TOKEN
// ══════════════════════════════════════════════════════
public record RefreshTokenCommand(
    string AccessToken,
    string RefreshToken,
    string? IpAddress = null
) : IRequest<RefreshTokenResponse>;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty();
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtService _jwt;
    private readonly IConfiguration _config;

    public RefreshTokenCommandHandler(IUnitOfWork uow, IJwtService jwt, IConfiguration config)
    {
        _uow    = uow;
        _jwt    = jwt;
        _config = config;
    }

    public async Task<RefreshTokenResponse> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        // 1. Lấy UserId từ access token cũ (dù đã expired)
        var userId = _jwt.GetUserIdFromExpiredToken(request.AccessToken)
            ?? throw new UnauthorizedException("Access token không hợp lệ.");

        // 2. Tìm refresh token trong DB
        var storedRt = await _uow.RefreshTokens.GetByTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedException("Refresh token không tồn tại.");

        // 3. Kiểm tra refresh token có thuộc user này không
        if (storedRt.UserId != userId)
            throw new UnauthorizedException("Refresh token không hợp lệ.");

        // 4. Kiểm tra còn active không
        if (!storedRt.IsActive)
            throw new UnauthorizedException("Refresh token đã hết hạn hoặc bị thu hồi.");

        // 5. Tạo token mới
        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        if (!user.IsActive)
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa.");

        var newAccessToken  = _jwt.GenerateAccessToken(user);
        var newRefreshToken = _jwt.GenerateRefreshToken();
        var refreshDays     = _config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
        var expiryMinutes   = _config.GetValue<int>("Jwt:ExpiresInMinutes", 60);

        // 6. Thu hồi refresh token cũ, thay bằng cái mới (rotation)
        storedRt.Revoke(request.IpAddress, newRefreshToken);
        _uow.RefreshTokens.Update(storedRt);

        var newRt = RefreshToken.Create(
            userId, newRefreshToken,
            DateTime.UtcNow.AddDays(refreshDays),
            request.IpAddress);
        _uow.RefreshTokens.Add(newRt);

        await _uow.SaveChangesAsync(ct);

        return new RefreshTokenResponse(
            AccessToken:       newAccessToken,
            RefreshToken:      newRefreshToken,
            AccessTokenExpiry: DateTime.UtcNow.AddMinutes(expiryMinutes));
    }
}

// ══════════════════════════════════════════════════════
// LOGOUT - thu hồi refresh token
// ══════════════════════════════════════════════════════
public record LogoutCommand(string RefreshToken, string? IpAddress = null) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IUnitOfWork _uow;
    public LogoutCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(LogoutCommand request, CancellationToken ct)
    {
        var token = await _uow.RefreshTokens.GetByTokenAsync(request.RefreshToken, ct);
        if (token is null || !token.IsActive) return; // idempotent - không throw lỗi

        token.Revoke(request.IpAddress);
        _uow.RefreshTokens.Update(token);
        await _uow.SaveChangesAsync(ct);
    }
}

// ══════════════════════════════════════════════════════
// REGISTER - tạo account + gửi email chào mừng
// ══════════════════════════════════════════════════════
public record RegisterCommand(
    string Username,
    string Email,
    string Password,
    string? FullName = null
) : IRequest<AuthResponse>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3).MaximumLength(50)
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username chỉ được chứa chữ, số và dấu gạch dưới.");

        RuleFor(x => x.Email)
            .NotEmpty().EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password phải có ít nhất 1 chữ hoa.")
            .Matches("[0-9]").WithMessage("Password phải có ít nhất 1 số.");
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;

    public RegisterCommandHandler(
        IUnitOfWork uow, IPasswordHasher hasher,
        IJwtService jwt, IEmailService email, IConfiguration config)
    {
        _uow    = uow;
        _hasher = hasher;
        _jwt    = jwt;
        _email  = email;
        _config = config;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await _uow.Users.ExistsByEmailAsync(request.Email, ct))
            throw new ConflictException($"Email '{request.Email}' đã được sử dụng.");

        if (await _uow.Users.ExistsByUsernameAsync(request.Username, ct))
            throw new ConflictException($"Username '{request.Username}' đã tồn tại.");

        var hash   = _hasher.Hash(request.Password);
        var result = Domain.Entities.User.Create(request.Username, request.Email, hash, request.FullName);

        if (result.IsFailure)
           throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });

        var user = result.Value;
        _uow.Users.Add(user);

        // Tạo token ngay sau khi đăng ký
        var accessToken   = _jwt.GenerateAccessToken(user);
        var refreshToken  = _jwt.GenerateRefreshToken();
        var refreshDays   = _config.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
        var expiryMinutes = _config.GetValue<int>("Jwt:ExpiresInMinutes", 60);

        _uow.RefreshTokens.Add(
            RefreshToken.Create(user.Id, refreshToken, DateTime.UtcNow.AddDays(refreshDays)));

        await _uow.SaveChangesAsync(ct);

        // Gửi email chào mừng (fire-and-forget, không chặn response)
        _ = _email.SendWelcomeAsync(user.Email.Value, user.Username, ct);

        return new AuthResponse(
            AccessToken:       accessToken,
            RefreshToken:      refreshToken,
            AccessTokenExpiry: DateTime.UtcNow.AddMinutes(expiryMinutes),
            User: new UserInfo(user.Id, user.Username, user.Email.Value, user.FullName, user.Roles));
    }
}
