using Application.Categories.Commands.CreateCategory;
using Application.Categories.Commands.DeleteCategory;
using Application.Categories.Commands.UpdateCategory;
using Application.Categories.Queries.GetAllCategories;
using Application.Categories.Queries.GetCategoryById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CategoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoryController(IMediator mediator) => _mediator = mediator;

    // ── GET /api/category ─────────────────────────────
    /// <summary>Lấy danh sách tất cả danh mục (public)</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllCategoriesQuery(), ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    // ── GET /api/category/{id} ────────────────────────
    /// <summary>Lấy danh mục theo Id (public)</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCategoryByIdQuery(id), ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    // ── POST /api/category ────────────────────────────
    /// <summary>Tạo danh mục mới (Admin only)</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryRequest request,
        CancellationToken ct)
    {
        var result = await _mediator.Send(
            new CreateCategoryCommand(request.Name, request.Description), ct);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, new { id = result.Value })
            : BadRequest(result.Error);
    }

    // ── PUT /api/category/{id} ────────────────────────
    /// <summary>Cập nhật danh mục (Admin only)</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken ct)
    {
        var result = await _mediator.Send(
            new UpdateCategoryCommand(id, request.Name, request.Description), ct);

        return result.IsSuccess
            ? NoContent()
            : BadRequest(result.Error);
    }

    // ── DELETE /api/category/{id} ─────────────────────
    /// <summary>Xóa danh mục (Admin only)</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteCategoryCommand(id), ct);
        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

// ── Request DTOs ──────────────────────────────────────
public sealed record CreateCategoryRequest(string Name, string? Description);
public sealed record UpdateCategoryRequest(string Name, string? Description);