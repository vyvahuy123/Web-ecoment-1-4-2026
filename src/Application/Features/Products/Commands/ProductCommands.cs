using Application.Common.Exceptions;
using Application.Features.Products.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Products.Commands;

// FIX: CategoryId đổi thành Guid? (nullable) — frontend có thể không chọn danh mục khi tạo
// FIX: Stock bỏ khỏi command vì frontend không gửi stock khi create (dùng AdjustStock riêng)
public record CreateProductCommand(
    string Name,
    decimal Price,
    Guid? CategoryId,
    string? Description = null,
    string? ImageUrl = null
) : IRequest<ProductDto>;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Giá không được âm.");
        // FIX: bỏ validate CategoryId.NotEmpty() vì có thể null khi không chọn danh mục
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IUnitOfWork _uow;
    public CreateProductCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ProductDto> Handle(CreateProductCommand req, CancellationToken ct)
    {
        // FIX: truyền stock = 0 mặc định khi tạo mới, categoryId nullable
        var result = Product.Create(
            req.Name,
            req.Price,
            stock: 0,
            categoryId: req.CategoryId ?? Guid.Empty,
            description: req.Description
        );

        if (result.IsFailure)
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });

        // FIX: set ImageUrl sau khi tạo nếu có
        if (!string.IsNullOrWhiteSpace(req.ImageUrl))
            result.Value.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId);

        _uow.Products.Add(result.Value);
        await _uow.SaveChangesAsync(ct);
        return ProductMapper.ToDto(result.Value);
    }
}

public record UpdateProductCommand(
    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId
) : IRequest<ProductDto>;

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
        var product = await _uow.Products.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Product), req.Id);

        // FIX: truyền đầy đủ Description và CategoryId — domain Update() nhận đúng
        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId);

        if (result.IsFailure)
            throw new Exception(result.Error!);

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
        var product = await _uow.Products.GetByIdAsync(req.ProductId, ct)
            ?? throw new NotFoundException(nameof(Product), req.ProductId);
        var result = product.AdjustStock(req.Delta);
        if (result.IsFailure)
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("stock", result.Error!) });
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
        var product = await _uow.Products.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Product), req.Id);
        product.Delete();
        _uow.Products.Update(product);
        await _uow.SaveChangesAsync(ct);
    }
}