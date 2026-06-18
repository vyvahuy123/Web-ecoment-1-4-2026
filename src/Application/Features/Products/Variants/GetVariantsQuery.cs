using Domain.Interfaces;
using MediatR;

namespace Application.Features.Products.Variants;

public record VariantDto(Guid Id, string Color, string Size, decimal Price, int Stock, string? ImageUrl);

public record GetVariantsByProductQuery(Guid ProductId) : IRequest<IEnumerable<VariantDto>>;

public class GetVariantsByProductQueryHandler : IRequestHandler<GetVariantsByProductQuery, IEnumerable<VariantDto>>
{
    private readonly IUnitOfWork _uow;
    public GetVariantsByProductQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<VariantDto>> Handle(GetVariantsByProductQuery request, CancellationToken ct)
    {
        var variants = await _uow.ProductVariants.GetByProductIdAsync(request.ProductId, ct);
        return variants.Select(v => new VariantDto(v.Id, v.Color, v.Size, v.Price, v.Stock, v.ImageUrl));
    }
}
