using Application.Common.Exceptions;
using Application.Features.News.DTOs;
using Application.Features.News;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.News.Queries;

public record GetNewsDetailQuery(int Id) : IRequest<NewsDto>;

public class GetNewsDetailQueryHandler : IRequestHandler<GetNewsDetailQuery, NewsDto>
{
    private readonly IUnitOfWork _uow;

    public GetNewsDetailQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<NewsDto> Handle(GetNewsDetailQuery request, CancellationToken ct)
    {
        var news = await _uow.News.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(News), request.Id);

        return news.ToDto();
    }
}