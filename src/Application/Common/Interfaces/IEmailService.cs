namespace Application.Common.Interfaces;

public record EmailMessage(
    string To,
    string Subject,
    string Body,
    bool IsHtml = true,
    string? From = null
);

/// <summary>
/// Email service abstraction.
/// Infrastructure có thể implement bằng SendGrid, SMTP, hay bất kỳ provider nào.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
    Task SendWelcomeAsync(string toEmail, string username, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string resetLink, CancellationToken ct = default);
}
