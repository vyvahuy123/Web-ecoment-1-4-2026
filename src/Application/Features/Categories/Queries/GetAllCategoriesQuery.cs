using MediatR;
using Domain.Common;
using Domain.Interfaces;
using Application.Categories.DTOs;
using Application.Categories.Mapper;

namespace Application.Categories.Queries.GetAllCategories;

public sealed record GetAllCategoriesQuery : IRequest<Result<List<CategoryDto>>>;

public sealed class GetAllCategoriesQueryHandler
    : IRequestHandler<GetAllCategoriesQuery, Result<List<CategoryDto>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllCategoriesQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<List<CategoryDto>>> Handle(
        GetAllCategoriesQuery request,
        CancellationToken ct)
    {
        var categories = await _uow.Categories.GetAllAsync(ct);

        var dtos = categories
            .Select(c => c.ToDto())
            .ToList();

        return Result.Success(dtos);
    }
}