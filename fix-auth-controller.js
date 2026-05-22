const fs = require('fs');
const path = 'E:/CleanArchitecture/src/WebApi/Controllers/AuthController.cs';
let code = fs.readFileSync(path, 'utf8');

// Thêm 2 endpoint trước dấu } cuối cùng
const newEndpoints = `
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ForgotPasswordCommand(req.Email), ct);
        return Ok(new { message = "Neu email ton tai, ma xac nhan se duoc gui." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ResetPasswordCommand(req.Email, req.Token, req.NewPassword), ct);
        return Ok(new { message = "Mat khau da duoc doi thanh cong." });
    }
}

public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
`;

// Tìm dấu } cuối và thay
const lastBrace = code.lastIndexOf('\n}');
code = code.slice(0, lastBrace) + newEndpoints;

fs.writeFileSync(path, code);
console.log('Done:', code.includes('forgot-password') ? 'OK' : 'FAILED');
