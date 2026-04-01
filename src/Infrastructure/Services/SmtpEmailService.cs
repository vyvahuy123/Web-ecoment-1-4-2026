using Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Services;

/// <summary>
/// Email service dùng SMTP chuẩn (Gmail, Outlook, Mailtrap...).
/// Đổi sang SendGrid chỉ cần swap implementation ở DI.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        var smtpSection = _config.GetSection("Email:Smtp");
        var host        = smtpSection["Host"] ?? "localhost";
        var port        = smtpSection.GetValue<int>("Port", 587);
        var user        = smtpSection["Username"];
        var pass        = smtpSection["Password"];
        var fromEmail   = message.From ?? _config["Email:DefaultFrom"] ?? "noreply@example.com";

        using var client = new SmtpClient(host, port)
        {
            EnableSsl      = smtpSection.GetValue<bool>("EnableSsl", true),
            Credentials    = new NetworkCredential(user, pass),
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        using var mail = new MailMessage(fromEmail, message.To, message.Subject, message.Body)
        {
            IsBodyHtml = message.IsHtml
        };

        try
        {
            await client.SendMailAsync(mail, ct);
            _logger.LogInformation("Email sent to {To} | Subject: {Subject}", message.To, message.Subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            throw;
        }
    }

    public async Task SendWelcomeAsync(string toEmail, string username, CancellationToken ct = default)
    {
        var appName = _config["App:Name"] ?? "App";
        var body = $"""
            <h2>Chào mừng {username}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>{appName}</strong>.</p>
            <p>Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
            <br/>
            <p>Trân trọng,<br/>Team {appName}</p>
            """;

        await SendAsync(new EmailMessage(toEmail, $"Chào mừng đến với {appName}!", body), ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        var appName = _config["App:Name"] ?? "App";
        var body = $"""
            <h2>Yêu cầu đặt lại mật khẩu</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>
              <a href="{resetLink}" style="
                background:#4F46E5;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;display:inline-block">
                Đặt lại mật khẩu
              </a>
            </p>
            <p>Link này có hiệu lực trong <strong>15 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            """;

        await SendAsync(new EmailMessage(toEmail, "Đặt lại mật khẩu", body), ct);
    }
}
