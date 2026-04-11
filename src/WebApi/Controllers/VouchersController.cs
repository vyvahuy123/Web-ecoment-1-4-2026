using Application.Features.Vouchers.Commands;
using Application.Features.Vouchers.DTOs;
using Application.Features.Vouchers.Queries;
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

    /// <summary>Lấy danh sách voucher - Admin</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<VoucherDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetAllVouchersQuery(page, pageSize), ct));

    /// <summary>Validate voucher trước khi đặt hàng</summary>
    [HttpGet("validate")]
    [Authorize]
    [ProducesResponseType(typeof(ValidateVoucherDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Validate(
        [FromQuery] string code,
        [FromQuery] decimal orderAmount,
        CancellationToken ct)
        => Ok(await _mediator.Send(new ValidateVoucherQuery(code, UserId, orderAmount), ct));

    /// <summary>Tạo voucher mới - Admin</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(VoucherDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateVoucherCommand cmd, CancellationToken ct)
    {
        var result = await _mediator.Send(cmd, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}