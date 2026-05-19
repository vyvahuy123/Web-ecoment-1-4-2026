const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/src/WebApi/Controllers/CollectionsController.cs', `using Application.Features.Collections.Commands;
using Application.Features.Collections.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/collections")]
public class CollectionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CollectionsController(IMediator mediator) => _mediator = mediator;

    // GET /api/collections
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _mediator.Send(new GetCollectionsQuery()));

    // GET /api/collections/active
    [HttpGet("active")]
    public async Task<IActionResult> GetActive() =>
        Ok(await _mediator.Send(new GetActiveCollectionsQuery()));

    // GET /api/collections/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) =>
        Ok(await _mediator.Send(new GetCollectionByIdQuery(id)));

    // POST /api/collections
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCollectionCommand cmd)
    {
        var result = await _mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/collections/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollectionRequest req)
    {
        var result = await _mediator.Send(new UpdateCollectionCommand(
            id, req.Name, req.DiscountPercent, req.StartDate, req.EndDate, req.Description, req.ImageUrl));
        return Ok(result);
    }

    // DELETE /api/collections/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteCollectionCommand(id));
        return NoContent();
    }

    // POST /api/collections/{id}/products
    [HttpPost("{id:guid}/products")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddProduct(Guid id, [FromBody] ProductIdRequest req)
    {
        await _mediator.Send(new AddProductToCollectionCommand(id, req.ProductId));
        return Ok();
    }

    // DELETE /api/collections/{id}/products/{productId}
    [HttpDelete("{id:guid}/products/{productId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveProduct(Guid id, Guid productId)
    {
        await _mediator.Send(new RemoveProductFromCollectionCommand(id, productId));
        return NoContent();
    }
}

public record UpdateCollectionRequest(
    string Name,
    decimal DiscountPercent,
    DateTime StartDate,
    DateTime EndDate,
    string? Description,
    string? ImageUrl
);

public record ProductIdRequest(Guid ProductId);
`);

console.log('Done');
