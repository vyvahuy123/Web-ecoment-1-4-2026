const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Domain/Entities/User.cs';
let code = fs.readFileSync(path, 'utf8');

// Thêm properties reset token sau LastLoginAt
code = code.replace(
    'public DateTime? LastLoginAt { get; private set; }',
    `public DateTime? LastLoginAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }`
);

// Thêm methods
code = code.replace(
    'public Result ChangePassword(',
    `public void SetPasswordResetToken(string token, DateTime expiry)
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

    public Result ChangePassword(`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('PasswordResetToken') ? 'OK' : 'FAILED');
