using Application.Features.Notifications.Commands;
using Application.Features.Notifications.DTOs;
using Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;
    public NotificationsController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());

    /// <summary>Lấy danh sách thông báo</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (items, total, unread) = await _mediator.Send(
            new GetMyNotificationsQuery(UserId, page, pageSize), ct);
        return Ok(new { items, total, unread });
    }

    /// <summary>Đánh dấu 1 thông báo đã đọc</summary>
    [HttpPatch("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new MarkAsReadCommand(UserId, id), ct);
        return NoContent();
    }

    /// <summary>Đánh dấu tất cả thông báo đã đọc</summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await _mediator.Send(new MarkAllAsReadCommand(UserId), ct);
        return NoContent();
    }
}