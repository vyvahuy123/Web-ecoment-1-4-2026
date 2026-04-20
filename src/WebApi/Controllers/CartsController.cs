using Application.Features.Carts.Commands;
using Application.Features.Carts.DTOs;
using Application.Features.Carts.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CartsController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy giỏ hàng của user hiện tại</summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCart(CancellationToken ct)
        => Ok(await _mediator.Send(new GetMyCartQuery(UserId), ct));

    /// <summary>Thêm sản phẩm vào giỏ hàng</summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new AddToCartCommand(UserId, req.ProductId, req.Quantity), ct));

    /// <summary>Cập nhật số lượng sản phẩm trong giỏ</summary>
    [HttpPut("items/{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateCartItemRequest req, CancellationToken ct)
    {
        await _mediator.Send(new UpdateCartItemCommand(UserId, productId, req.Quantity), ct);
        return NoContent();
    }

    /// <summary>Xóa 1 sản phẩm khỏi giỏ hàng</summary>
    [HttpDelete("items/{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken ct)
    {
        await _mediator.Send(new RemoveFromCartCommand(UserId, productId), ct);
        return NoContent();
    }

    /// <summary>Xóa toàn bộ giỏ hàng</summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Clear(CancellationToken ct)
    {
        await _mediator.Send(new ClearCartCommand(UserId), ct);
        return NoContent();
    }
}

public record AddCartItemRequest(Guid ProductId, int Quantity);
public record UpdateCartItemRequest(int Quantity);