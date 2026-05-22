const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Infrastructure/Persistence/Configurations/UserConfiguration.cs';
let code = fs.readFileSync(path, 'utf8');

// Tìm dấu } cuối của method Configure và thêm vào trước
const lastBrace = code.lastIndexOf('    }');
const insert = `
        builder.Property(u => u.PasswordResetToken).HasColumnName("password_reset_token").HasMaxLength(10).IsRequired(false);
        builder.Property(u => u.PasswordResetTokenExpiry).HasColumnName("password_reset_token_expiry").IsRequired(false);
`;
code = code.slice(0, lastBrace) + insert + code.slice(lastBrace);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('PasswordResetToken') ? 'OK' : 'FAILED');
