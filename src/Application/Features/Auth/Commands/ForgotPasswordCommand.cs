using Application.Common.Interfaces;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest<bool>;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _email;
    private readonly Microsoft.Extensions.Configuration.IConfiguration _config;

    public ForgotPasswordCommandHandler(IUnitOfWork uow, IEmailService email, Microsoft.Extensions.Configuration.IConfiguration config)
    {
        _uow = uow;
        _email = email;
        _config = config;
    }

    public async Task<bool> Handle(ForgotPasswordCommand req, CancellationToken ct)
    {
        var user = await _uow.Users.GetByEmailAsync(req.Email, ct);
        if (user == null) return true; // Không tiết lộ email có tồn tại không

        // Tạo token 6 số
        var token = new Random().Next(100000, 999999).ToString();
        user.SetPasswordResetToken(token, DateTime.UtcNow.AddMinutes(15));
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        var clientUrl = _config["App:ClientUrl"] ?? "http://localhost:3000";
        var body = $"""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px">
              <h2 style="color:#1a1a1a">Đặt lại mật khẩu</h2>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p>Mã xác nhận của bạn là:</p>
              <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#4F46E5;text-align:center;padding:16px;background:#f5f5ff;border-radius:8px">
                {token}
              </div>
              <p style="color:#666;font-size:13px">Mã này có hiệu lực trong <strong>15 phút</strong>.</p>
              <p style="color:#666;font-size:13px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            </div>
            """;

        await _email.SendAsync(new EmailMessage(req.Email, "Mã đặt lại mật khẩu - INDIAS Store", body), ct);
        return true;
    }
}
