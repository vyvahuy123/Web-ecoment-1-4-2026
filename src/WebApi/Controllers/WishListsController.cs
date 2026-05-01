using Application.Features.WishLists.Commands;
using Application.Features.WishLists.DTOs;
using Application.Features.WishLists.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class WishListsController : ControllerBase
{
    private readonly IMediator _mediator;
    public WishListsController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy danh sách yêu thích</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<WishListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyWishList(CancellationToken ct)
        => Ok(await _mediator.Send(new GetMyWishListQuery(UserId), ct));

    /// <summary>Thêm sản phẩm vào danh sách yêu thích</summary>
    [HttpPost("{productId:guid}")]
    [ProducesResponseType(typeof(WishListDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Add(Guid productId, CancellationToken ct)
    {
        var result = await _mediator.Send(new AddToWishListCommand(UserId, productId), ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Xóa sản phẩm khỏi danh sách yêu thích</summary>
    [HttpDelete("{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Remove(Guid productId, CancellationToken ct)
    {
        await _mediator.Send(new RemoveFromWishListCommand(UserId, productId), ct);
        return NoContent();
    }
}