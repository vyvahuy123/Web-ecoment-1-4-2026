using Domain.Common;
using Domain.Events;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// User Entity - chứa business logic thuần túy, không phụ thuộc framework nào
/// </summary>
public sealed class User : AuditableEntity
{
    // ── Private fields ──────────────────────────────────────────────────────
    private readonly List<string> _roles = new();

    // ── Properties ──────────────────────────────────────────────────────────
    public string Username { get; private set; } = default!;
    public Email Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string? FullName { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public IReadOnlyCollection<string> Roles => _roles.AsReadOnly();

    // ── EF Core requires parameterless constructor ───────────────────────────
    private User() { }

    // ── Factory Method (thay vì new User(...)) ───────────────────────────────
    public static Result<User> Create(string username, string email, string passwordHash, string? fullName = null)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Result.Failure<User>("Username không được để trống.");

        if (username.Length < 3 || username.Length > 50)
            return Result.Failure<User>("Username phải từ 3-50 ký tự.");

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

    // ── Business Methods ─────────────────────────────────────────────────────
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

}
