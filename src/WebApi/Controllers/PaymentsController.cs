// WebApi/Controllers/PaymentsController.cs
using Application.Features.Payments.Commands;
using Application.Features.Payments.DTOs;
using Application.Features.Payments.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Lấy danh sách payment - Admin</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAllPaymentsQuery(page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Tạo payment cho đơn hàng</summary>
    [HttpPost]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePaymentCommand cmd, CancellationToken ct)
    {
        var result = await _mediator.Send(cmd, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Xác nhận thanh toán thành công - Admin/Webhook</summary>
    [HttpPatch("{id:guid}/confirm")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmPaymentRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ConfirmPaymentCommand(id, req.TransactionId, req.GatewayResponse), ct);
        return NoContent();
    }

    /// <summary>Hoàn tiền - Admin</summary>
    [HttpPatch("{id:guid}/refund")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Refund(Guid id, [FromBody] RefundPaymentRequest req, CancellationToken ct)
    {
        await _mediator.Send(new RefundPaymentCommand(id, req.RefundAmount, req.Reason), ct);
        return NoContent();
    }
}

public record ConfirmPaymentRequest(string? TransactionId, string? GatewayResponse);
public record RefundPaymentRequest(decimal RefundAmount, string Reason);