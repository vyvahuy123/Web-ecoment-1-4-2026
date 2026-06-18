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

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetMyOrdersQuery(UserId, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOrderByIdQuery(id, UserId), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateOrderCommand(UserId, req.ShippingAddressId, req.PaymentMethod, req.Items, req.VoucherCode, req.Note), ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelOrderRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new CancelOrderCommand(id, UserId, req.Reason), ct));

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] OrderStatus? status = null, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(page, pageSize, status), ct);
        return Ok(result);
    }

    [HttpGet("user/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByUserId(Guid userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetMyOrdersQuery(userId, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/detail")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByIdAdmin(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOrderByIdQuery(id, Guid.Empty, true), ct));

    [HttpPatch("{id:guid}/approve-cancellation")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveCancellation(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new ApproveCancellationCommand(id), ct));

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateOrderStatusCommand(id, req.NewStatus), ct));
}

public record CreateOrderRequest(Guid ShippingAddressId, PaymentMethod PaymentMethod, List<OrderItemRequest> Items, string? VoucherCode = null, string? Note = null);
public record CancelOrderRequest(string Reason);
public record UpdateOrderStatusRequest(OrderStatus NewStatus);