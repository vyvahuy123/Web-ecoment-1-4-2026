using Application.Common.Exceptions;
using Application.Features.Products.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Products.Commands;

public record CreateProductCommand(
    string Name, decimal Price, int Stock, Guid CategoryId,
    string? Description = null, string? ImageUrl = null
) : IRequest<ProductDto>;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Giá không được âm.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("Tồn kho không được âm.");
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IUnitOfWork _uow;
    public CreateProductCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<ProductDto> Handle(CreateProductCommand req, CancellationToken ct)
    {
        var result = Product.Create(req.Name, req.Price, req.Stock, req.CategoryId, req.Description);
        if (result.IsFailure) throw new Application.Common.Exceptions.ValidationException(new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });
        _uow.Products.Add(result.Value);
        await _uow.SaveChangesAsync(ct);
        return ProductMapper.ToDto(result.Value);
    }
}

public record UpdateProductCommand(Guid Id, string Name, decimal Price, string? Description, string? ImageUrl) : IRequest<ProductDto>;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
    }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateProductCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<ProductDto> Handle(UpdateProductCommand req, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(req.Id, ct) ?? throw new NotFoundException(nameof(Product), req.Id);
        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl);
        if (result.IsFailure) throw new Application.Common.Exceptions.ValidationException(new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });
        _uow.Products.Update(product);
        await _uow.SaveChangesAsync(ct);
        return ProductMapper.ToDto(product);
    }
}

public record AdjustStockCommand(Guid ProductId, int Delta, string Reason) : IRequest<ProductDto>;

public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, ProductDto>
{
    private readonly IUnitOfWork _uow;
    public AdjustStockCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<ProductDto> Handle(AdjustStockCommand req, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(req.ProductId, ct) ?? throw new NotFoundException(nameof(Product), req.ProductId);
        var result = product.AdjustStock(req.Delta);
        if (result.IsFailure) throw new Application.Common.Exceptions.ValidationException(new[] { new FluentValidation.Results.ValidationFailure("stock", result.Error!) });
        _uow.Products.Update(product);
        await _uow.SaveChangesAsync(ct);
        return ProductMapper.ToDto(product);
    }
}

public record DeleteProductCommand(Guid Id) : IRequest;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IUnitOfWork _uow;
    public DeleteProductCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task Handle(DeleteProductCommand req, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(req.Id, ct) ?? throw new NotFoundException(nameof(Product), req.Id);
        product.Deactivate();
        _uow.Products.Update(product);
        await _uow.SaveChangesAsync(ct);
    }
}
