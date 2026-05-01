using MediatR;
using Domain.Common;
using Domain.Interfaces;
using Application.Categories.DTOs;
using Application.Categories.Mapper;

namespace Application.Categories.Queries.GetCategoryById;

public sealed record GetCategoryByIdQuery(Guid Id)
    : IRequest<Result<CategoryDto>>;

public sealed class GetCategoryByIdQueryHandler
    : IRequestHandler<GetCategoryByIdQuery, Result<CategoryDto>>
{
    private readonly IUnitOfWork _uow;

    public GetCategoryByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<CategoryDto>> Handle(
        GetCategoryByIdQuery request,
        CancellationToken ct)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Failure<CategoryDto>("Không tìm thấy danh mục.");

        return Result.Success(category.ToDto());
    }
}