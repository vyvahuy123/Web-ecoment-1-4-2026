using Application.Features.News.DTOs;
using Application.Features.News;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.News.Commands;

public record CreateNewsCommand(CreateNewsDto Dto) : IRequest<int>;

public class CreateNewsCommandHandler : IRequestHandler<CreateNewsCommand, int>
{
    private readonly IUnitOfWork _uow;

    public CreateNewsCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<int> Handle(CreateNewsCommand request, CancellationToken ct)
    {
        var news = request.Dto.ToEntity();
        _uow.News.Add(news);
        await _uow.SaveChangesAsync(ct);
        return news.Id;
    }
}