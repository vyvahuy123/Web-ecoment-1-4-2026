using System.Text.RegularExpressions;
using Domain.Common;

namespace Domain.ValueObjects;

/// <summary>
/// Email Value Object - bất biến, tự validate
/// </summary>
public sealed class Email : ValueObject
{
    private static readonly Regex EmailRegex =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Email>("Email không được để trống.");

        email = email.Trim().ToLower();

        if (!EmailRegex.IsMatch(email))
            return Result.Failure<Email>("Email không hợp lệ.");

        if (email.Length > 254)
            return Result.Failure<Email>("Email quá dài.");

        return Result.Success(new Email(email));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    // Implicit conversion tiện lợi
    public static implicit operator string(Email email) => email.Value;
}
