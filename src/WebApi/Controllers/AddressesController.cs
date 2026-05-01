using Application.Features.Addresses.Commands;
using Application.Features.Addresses.DTOs;
using Application.Features.Addresses.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IMediator _mediator;
    public AddressesController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy danh sách địa chỉ của user</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<AddressDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyAddresses(CancellationToken ct)
        => Ok(await _mediator.Send(new GetMyAddressesQuery(UserId), ct));

    /// <summary>Thêm địa chỉ mới</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AddressDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateAddressCommand cmd, CancellationToken ct)
    {
        var command = cmd with { UserId = UserId };
        var result = await _mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Cập nhật địa chỉ</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddressRequest req, CancellationToken ct)
    {
        await _mediator.Send(new UpdateAddressCommand(
            UserId, id,
            req.FullName, req.Phone,
            req.Province, req.District,
            req.Ward, req.Street,
            req.IsDefault), ct);
        return NoContent();
    }

    /// <summary>Xóa địa chỉ</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteAddressCommand(UserId, id), ct);
        return NoContent();
    }
}

public record UpdateAddressRequest(
    string FullName, string Phone,
    string Province, string District,
    string Ward, string Street,
    bool IsDefault);