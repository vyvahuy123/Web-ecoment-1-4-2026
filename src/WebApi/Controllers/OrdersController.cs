using Application.Common;
using Application.Features.Orders.Commands;
using Application.Features.Orders.DTOs;
using Application.Features.Orders.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy danh sách đơn hàng của user hiện tại</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(PagedResult<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10,
    CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetMyOrdersQuery(UserId, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Lấy chi tiết 1 đơn hàng của user</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOrderByIdQuery(id, UserId), ct));

    /// <summary>Tạo đơn hàng mới</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderRequest req,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateOrderCommand(
            UserId,
            req.ShippingAddressId,
            req.PaymentMethod,
            req.Items,
            req.VoucherCode,
            req.Note), ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Huỷ đơn hàng (chỉ Pending/Confirmed)</summary>
    [HttpPatch("{id:guid}/cancel")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cancel(
        Guid id,
        [FromBody] CancelOrderRequest req,
        CancellationToken ct)
        => Ok(await _mediator.Send(new CancelOrderCommand(id, UserId, req.Reason), ct));

    // ── Admin endpoints ────────────────────────────────────────────────────

    /// <summary>Lấy tất cả đơn hàng - Admin</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PagedResult<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] OrderStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(page, pageSize, status), ct);
        return Ok(result);
    }
    /// <summary>Lấy orders của 1 user cụ thể - Admin only</summary>
    [HttpGet("user/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByUserId(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetMyOrdersQuery(userId, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Cập nhật trạng thái đơn hàng - Admin</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest req,
        CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateOrderStatusCommand(id, req.NewStatus), ct));

}


// Request records
public record CreateOrderRequest(
    Guid ShippingAddressId,
    PaymentMethod PaymentMethod,
    List<OrderItemRequest> Items,
    string? VoucherCode = null,
    string? Note = null);

public record CancelOrderRequest(string Reason);
public record UpdateOrderStatusRequest(OrderStatus NewStatus);