using Application.Features.Products.Variants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/products/{productId}/variants")]
[Produces("application/json")]
public class ProductVariantsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProductVariantsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(Guid productId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVariantsByProductQuery(productId), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Guid productId, [FromBody] CreateVariantRequest req, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateVariantCommand(
            productId, req.Color, req.Size, req.Price, req.Stock, req.ImageUrl), ct);
        return CreatedAtAction(nameof(GetAll), new { productId }, new { id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVariantRequest req, CancellationToken ct)
    {
        await _mediator.Send(new UpdateVariantCommand(id, req.Color, req.Size, req.Price, req.Stock, req.ImageUrl), ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteVariantCommand(id), ct);
        return NoContent();
    }
}

public record CreateVariantRequest(string Color, string Size, decimal Price, int Stock, string? ImageUrl);
public record UpdateVariantRequest(string Color, string Size, decimal Price, int Stock, string? ImageUrl);
