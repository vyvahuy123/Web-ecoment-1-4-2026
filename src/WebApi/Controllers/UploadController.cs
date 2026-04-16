using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    [HttpPost("image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(
        IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Không có file.");

        var allowedExt = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp" };
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExt.Contains(ext))
            return BadRequest("Chỉ chấp nhận JPG, PNG, WEBP, GIF.");

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File không được vượt quá 5MB.");

        // Dùng path cố định — không phụ thuộc WebRootPath
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, ct);

        var url = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url });
    }
}