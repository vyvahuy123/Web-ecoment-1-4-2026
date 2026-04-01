using Application.Common;
using Application.Features.Products.Commands;
using Application.Features.Products.DTOs;
using Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProductsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Lấy danh sách sản phẩm có phân trang + filter</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ProductSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetProductsQuery(page, pageSize, search, categoryId), ct);
        return Ok(result);
    }

    /// <summary>Lấy chi tiết 1 sản phẩm</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetProductByIdQuery(id), ct));

    /// <summary>Tạo sản phẩm mới - chỉ Admin</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand cmd, CancellationToken ct)
    {
        var result = await _mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Cập nhật sản phẩm - chỉ Admin</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id, [FromBody] UpdateProductRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new UpdateProductCommand(id, req.Name, req.Price, req.Description, req.ImageUrl), ct);
        return Ok(result);
    }

    /// <summary>Điều chỉnh tồn kho (nhập/xuất kho) - chỉ Admin</summary>
    [HttpPatch("{id:guid}/stock")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdjustStock(
        Guid id, [FromBody] AdjustStockRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new AdjustStockCommand(id, req.Delta, req.Reason), ct);
        return Ok(result);
    }

    /// <summary>Xóa sản phẩm (soft delete) - chỉ Admin</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteProductCommand(id), ct);
        return NoContent();
    }
}

public record UpdateProductRequest(
    string Name, decimal Price,
    string? Description, string? ImageUrl);

public record AdjustStockRequest(int Delta, string Reason);
