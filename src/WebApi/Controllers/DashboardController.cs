using Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(
        [FromQuery] int year = 0,
        [FromQuery] int? quarter = null,
        CancellationToken ct = default)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await _mediator.Send(new GetDashboardStatsQuery(year, quarter), ct);
        return Ok(result);
    }
}