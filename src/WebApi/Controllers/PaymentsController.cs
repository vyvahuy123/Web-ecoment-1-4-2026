using Application.Features.Payments.Commands;
using Application.Features.Payments.DTOs;
using Application.Features.Payments.Queries;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IVNPayService _vnpay;
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;

    public PaymentsController(IMediator mediator, IVNPayService vnpay, IUnitOfWork uow, IConfiguration config)
    {
        _mediator = mediator;
        _vnpay = vnpay;
        _uow = uow;
        _config = config;
    }

    /// <summary>Lấy danh sách payment - Admin</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAllPaymentsQuery(page, pageSize), ct));

    /// <summary>Tạo payment COD</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentCommand cmd, CancellationToken ct)
        => StatusCode(201, await _mediator.Send(cmd, ct));

    /// <summary>Tạo URL thanh toán VNPay — FE redirect sang đây</summary>
    [HttpPost("vnpay/create-url")]
    public async Task<IActionResult> CreateVNPayUrl([FromBody] CreateVNPayUrlRequest req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct);
        if (order is null) return NotFound("Order not found.");

        var payment = await _uow.Payments.GetByOrderIdAsync(req.OrderId, ct);
        if (payment is null)
        {
            payment = Domain.Entities.Payment.Create(
                req.OrderId,
                Domain.Enums.PaymentMethod.VNPay,
                order.TotalAmount);
            _uow.Payments.Add(payment);
            await _uow.SaveChangesAsync(ct);
        }

        var url = _vnpay.CreatePaymentUrl(new VNPayRequest
        {
            PaymentId = payment.Id,
            OrderCode = order.OrderCode,
            Amount = order.TotalAmount,
            OrderInfo = $"Thanh toan don hang {order.OrderCode}",
        }, HttpContext);

        return Ok(new { paymentUrl = url });
    }

    /// <summary>VNPay redirect về sau khi user thanh toán xong</summary>
    [HttpGet("vnpay/return")]
    [AllowAnonymous]
    public async Task<IActionResult> VNPayReturn(CancellationToken ct)
    {
        var response = _vnpay.ProcessCallback(Request.Query);
        var clientUrl = _config["App:ClientUrl"] ?? "http://localhost:5173";

        if (response.IsSuccess)
        {
            var payment = await _uow.Payments.GetByIdAsync(response.PaymentId, ct);
            if (payment is not null)
            {
                payment.MarkPaid(response.TransactionId, "VNPay callback confirmed");
                var order = await _uow.Orders.GetByIdAsync(payment.OrderId, ct);
                order?.MarkPaid();
                _uow.Payments.Update(payment);
                if (order is not null) _uow.Orders.Update(order);
                await _uow.SaveChangesAsync(ct);
            }
            return Redirect($"{clientUrl}/order-success?paymentId={response.PaymentId}&status=success");
        }

        return Redirect($"{clientUrl}/payment-failed?reason={Uri.EscapeDataString(response.Message)}");
    }

    /// <summary>Xác nhận thanh toán - Admin</summary>
    [HttpPatch("{id:guid}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmPaymentRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ConfirmPaymentCommand(id, req.TransactionId, req.GatewayResponse), ct);
        return NoContent();
    }

    /// <summary>Hoàn tiền - Admin</summary>
    [HttpPatch("{id:guid}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Refund(Guid id, [FromBody] RefundPaymentRequest req, CancellationToken ct)
    {
        await _mediator.Send(new RefundPaymentCommand(id, req.RefundAmount, req.Reason), ct);
        return NoContent();
    }
}

public record CreateVNPayUrlRequest(Guid OrderId);
public record ConfirmPaymentRequest(string? TransactionId, string? GatewayResponse);
public record RefundPaymentRequest(decimal RefundAmount, string Reason);