using Application.Common.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Products.Variants;

public record DeleteVariantCommand(Guid Id) : IRequest;

public class DeleteVariantCommandHandler : IRequestHandler<DeleteVariantCommand>
{
    private readonly IUnitOfWork _uow;
    public DeleteVariantCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeleteVariantCommand request, CancellationToken ct)
    {
        var variant = await _uow.ProductVariants.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("ProductVariant", request.Id);

        _uow.ProductVariants.Remove(variant);
        await _uow.SaveChangesAsync(ct);
    }
}
