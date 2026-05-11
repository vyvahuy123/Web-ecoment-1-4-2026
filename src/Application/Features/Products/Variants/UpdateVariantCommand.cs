using Application.Common.Exceptions;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Products.Variants;

public record UpdateVariantCommand(
    Guid Id,
    string Color,
    string Size,
    decimal Price,
    int Stock,
    string? ImageUrl = null
) : IRequest;

public class UpdateVariantCommandValidator : AbstractValidator<UpdateVariantCommand>
{
    public UpdateVariantCommandValidator()
    {
        RuleFor(x => x.Color).NotEmpty().WithMessage("Màu không được để trống.");
        RuleFor(x => x.Size).NotEmpty().WithMessage("Size không được để trống.");
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Giá không được âm.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("Số lượng không được âm.");
    }
}

public class UpdateVariantCommandHandler : IRequestHandler<UpdateVariantCommand>
{
    private readonly IUnitOfWork _uow;
    public UpdateVariantCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(UpdateVariantCommand request, CancellationToken ct)
    {
        var variant = await _uow.ProductVariants.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("ProductVariant", request.Id);

        var result = variant.Update(request.Color, request.Size, request.Price, request.Stock, request.ImageUrl);
        if (result.IsFailure)
            throw new ConflictException(result.Error!);

        _uow.ProductVariants.Update(variant);
        await _uow.SaveChangesAsync(ct);
    }
}
