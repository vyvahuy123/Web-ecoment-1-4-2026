using Application.Features.Banners.Commands;
using Application.Features.Banners.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BannersController : ControllerBase
{
    private readonly IMediator _mediator;
    public BannersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetActive(CancellationToken ct)
        => Ok(await _mediator.Send(new GetBannersQuery(true), ct));

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetBannersQuery(false), ct));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBannerCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBannerRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateBannerCommand(id, req.Tag, req.Title, req.Description,
            req.ButtonText, req.ButtonHref, req.ImageUrl, req.BackgroundColor, req.SortOrder, req.IsActive), ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteBannerCommand(id), ct);
        return NoContent();
    }
}

public record UpdateBannerRequest(
    string Tag, string Title, string Description,
    string ButtonText, string ButtonHref,
    string? ImageUrl, string BackgroundColor, int SortOrder, bool IsActive);