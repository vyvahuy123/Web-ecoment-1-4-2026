using Application.Features.Vouchers.Commands;
using Application.Features.Vouchers.DTOs;
using Application.Features.Vouchers.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VouchersController : ControllerBase
{
    private readonly IMediator _mediator;
    public VouchersController(IMediator mediator) => _mediator = mediator;
    private Guid UserId => Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAllVouchersQuery(page, pageSize), ct));

    [HttpGet("validate")]
    [Authorize]
    public async Task<IActionResult> Validate([FromQuery] string code, [FromQuery] decimal orderAmount, CancellationToken ct)
        => Ok(await _mediator.Send(new ValidateVoucherQuery(code, UserId, orderAmount), ct));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVoucherCommand cmd, CancellationToken ct)
        => StatusCode(201, await _mediator.Send(cmd, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVoucherRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateVoucherCommand(
            id, req.Code, req.Type, req.DiscountValue, req.TotalQuantity,
            req.StartDate, req.EndDate, req.MinOrderAmount, req.MaxDiscountAmount,
            req.MaxUsagePerUser, req.IsActive, req.Description), ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteVoucherCommand(id), ct);
        return NoContent();
    }
}

public record UpdateVoucherRequest(
    string Code,
    VoucherType Type,
    decimal DiscountValue,
    int TotalQuantity,
    DateTime StartDate,
    DateTime EndDate,
    decimal MinOrderAmount = 0,
    decimal? MaxDiscountAmount = null,
    int MaxUsagePerUser = 1,
    bool IsActive = true,
    string? Description = null);
