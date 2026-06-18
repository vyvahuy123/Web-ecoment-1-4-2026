using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Products.Variants;

public record CreateVariantCommand(
    Guid ProductId,
    string Color,
    string Size,
    decimal Price,
    int Stock,
    string? ImageUrl = null
) : IRequest<Guid>;

public class CreateVariantCommandValidator : AbstractValidator<CreateVariantCommand>
{
    public CreateVariantCommandValidator()
    {
        RuleFor(x => x.Color).NotEmpty().WithMessage("Màu không được để trống.");
        RuleFor(x => x.Size).NotEmpty().WithMessage("Size không được để trống.");
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Giá không được âm.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("Số lượng không được âm.");
    }
}

public class CreateVariantCommandHandler : IRequestHandler<CreateVariantCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    public CreateVariantCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Guid> Handle(CreateVariantCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(request.ProductId, ct)
            ?? throw new NotFoundException("Product", request.ProductId);

        var existing = await _uow.ProductVariants.GetByProductColorSizeAsync(
            request.ProductId, request.Color, request.Size, ct);
        if (existing != null)
            throw new ConflictException($"Variant {request.Color}/{request.Size} đã tồn tại.");

        var result = ProductVariant.Create(
            request.ProductId, request.Color, request.Size,
            request.Price, request.Stock, request.ImageUrl);

        if (result.IsFailure)
            throw new ConflictException(result.Error!);

        _uow.ProductVariants.Add(result.Value);
        await _uow.SaveChangesAsync(ct);
        return result.Value.Id;
    }
}
