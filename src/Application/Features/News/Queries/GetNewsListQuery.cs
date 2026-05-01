using Application.Features.News.DTOs;
using Application.Features.News;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.News.Queries;

public record GetNewsListQuery(
    string? Category = null,
    bool? IsPublished = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<GetNewsListResult>;

public class GetNewsListResult
{
    public List<NewsListDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public class GetNewsListQueryHandler : IRequestHandler<GetNewsListQuery, GetNewsListResult>
{
    private readonly IUnitOfWork _uow;

    public GetNewsListQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<GetNewsListResult> Handle(GetNewsListQuery request, CancellationToken ct)
    {
        var (items, total) = await _uow.News.GetPagedAsync(
            request.Category, request.IsPublished, request.Page, request.PageSize, ct);

        return new GetNewsListResult
        {
            Items = items.Select(n => n.ToListDto()).ToList(),
            TotalCount = total,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}