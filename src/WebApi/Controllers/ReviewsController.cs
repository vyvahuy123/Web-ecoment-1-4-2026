using Application.Features.Reviews.Commands;
using Application.Features.Reviews.DTOs;
using Application.Features.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ReviewsController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy reviews của sản phẩm</summary>
    [HttpGet("product/{productId:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<ReviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductReviews(
        Guid productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetProductReviewsQuery(productId, page, pageSize), ct));

    /// <summary>Tạo review cho sản phẩm đã mua</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new CreateReviewCommand(UserId, req.ProductId, req.OrderId, req.Rating, req.Comment, req.ImageUrls), ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Duyệt review - Admin</summary>
    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ApproveReviewCommand(id), ct);
        return NoContent();
    }

    /// <summary>Từ chối review - Admin</summary>
    [HttpPatch("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new RejectReviewCommand(id), ct);
        return NoContent();
    }

    /// <summary>Admin phản hồi review</summary>
    [HttpPatch("{id:guid}/reply")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyReviewRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ReplyReviewCommand(id, req.AdminReply), ct);
        return NoContent();
    }
}

public record CreateReviewRequest(
    Guid ProductId, Guid OrderId,
    int Rating, string? Comment,
    string? ImageUrls);

public record ReplyReviewRequest(string AdminReply);