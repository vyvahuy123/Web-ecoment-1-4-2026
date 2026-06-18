// WebApi/Controllers/NewsController.cs
using Application.Features.News.Commands;
using Application.Features.News.DTOs;
using Application.Features.News.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] string? category = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetNewsListQuery(
            Category: category,
            IsPublished: true,
            Page: page,
            PageSize: pageSize
        ));
        return Ok(result);
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetListAdmin(
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublished = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetNewsListQuery(
            Category: category,
            IsPublished: isPublished,
            Page: page,
            PageSize: pageSize
        ));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _mediator.Send(new GetNewsDetailQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateNewsDto dto)
    {
        var id = await _mediator.Send(new CreateNewsCommand(dto));
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateNewsDto dto)
    {
        var success = await _mediator.Send(new UpdateNewsCommand(id, dto));
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {     
        await _mediator.Send(new DeleteNewsCommand(id));
        return NoContent();
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG, WEBP are allowed.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "news");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var imageUrl = $"/images/news/{fileName}";
        return Ok(new { imageUrl });
    }
}