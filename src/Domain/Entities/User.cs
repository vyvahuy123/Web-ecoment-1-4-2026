using Domain.Common;
using Domain.Events;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// User Entity - chá»©a business logic thuáº§n tĂºy, khĂ´ng phá»¥ thuá»™c framework nĂ o
/// </summary>
public sealed class User : AuditableEntity
{
    // â”€â”€ Private fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private readonly List<string> _roles = new();

    // â”€â”€ Properties â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public string Username { get; private set; } = default!;
    public Email Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string? FullName { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public IReadOnlyCollection<string> Roles => _roles.AsReadOnly();

    // â”€â”€ EF Core requires parameterless constructor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private User() { }

    // â”€â”€ Factory Method (thay vĂ¬ new User(...)) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public static Result<User> Create(string username, string email, string passwordHash, string? fullName = null)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Result.Failure<User>("Username khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.");

        if (username.Length < 3 || username.Length > 50)
            return Result.Failure<User>("Username pháº£i tá»« 3-50 kĂ½ tá»±.");

        var emailResult = Email.Create(email);
        if (emailResult.IsFailure)
            return Result.Failure<User>(emailResult.Error!);

        var user = new User
        {
            Username    = username.Trim().ToLower(),
            Email       = emailResult.Value,
            PasswordHash = passwordHash,
            FullName    = fullName?.Trim(),
            IsActive    = true
        };

        // Raise domain event
        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Username, user.Email.Value));
        return Result.Success(user);
    }

    // â”€â”€ Business Methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public Result UpdateProfile(string? fullName, string? newEmail)
    {
        if (newEmail is not null)
        {
            var emailResult = Email.Create(newEmail);
            if (emailResult.IsFailure) return Result.Failure(emailResult.Error!);
            Email = emailResult.Value;
        }

        FullName = fullName?.Trim();
        MarkAsUpdated();
        return Result.Success();
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
        MarkAsUpdated();
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkAsUpdated();
        AddDomainEvent(new UserDeactivatedEvent(Id));
    }
    public void Activate()
    {
        IsActive = true;
        MarkAsUpdated();
        AddDomainEvent(new UserActivatedEvent(Id));
    }

    public void AssignRole(string role)
    {
        if (!_roles.Contains(role))
            _roles.Add(role);
    }
    public void SetRole(string role)
    {
        _roles.Clear();
        if (!string.IsNullOrWhiteSpace(role))
            _roles.Add(role);
        MarkAsUpdated();
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
        MarkAsUpdated();
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        MarkAsUpdated();
    }

    public bool IsPasswordResetTokenValid(string token) =>
        PasswordResetToken == token &&
        PasswordResetTokenExpiry.HasValue &&
        PasswordResetTokenExpiry.Value > DateTime.UtcNow;

    public Result ResetPassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            return Result.Failure("Mat khau khong hop le.");
        PasswordHash = newPasswordHash;
        ClearPasswordResetToken();
        MarkAsUpdated();
        return Result.Success();
    }

    public Result ChangePassword(string currentPassword, string newPasswordHash, bool isCurrentPasswordValid)
    {
        if (!isCurrentPasswordValid)
            return Result.Failure("Mật khẩu hiện tại không đúng.");
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            return Result.Failure("Mật khẩu mới không hợp lệ.");
        PasswordHash = newPasswordHash;
        MarkAsUpdated();
        return Result.Success();
    }
}


// Append nothing - we'll use a script
