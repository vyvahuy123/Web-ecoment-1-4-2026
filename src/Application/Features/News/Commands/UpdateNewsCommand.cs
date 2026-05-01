using Application.Common.Exceptions;
using Application.Features.News.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.News.Commands;

public record UpdateNewsCommand(int Id, UpdateNewsDto Dto) : IRequest<bool>;

public class UpdateNewsCommandHandler : IRequestHandler<UpdateNewsCommand, bool>
{
    private readonly IUnitOfWork _uow;

    public UpdateNewsCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<bool> Handle(UpdateNewsCommand request, CancellationToken ct)
    {
        var news = await _uow.News.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(News), request.Id);

        news.Title = request.Dto.Title;
        news.Description = request.Dto.Description;
        news.Content = request.Dto.Content;
        news.ImageUrl = request.Dto.ImageUrl;
        news.Category = request.Dto.Category;
        news.IsPublished = request.Dto.IsPublished;
        news.UpdatedAt = DateTime.UtcNow;

        _uow.News.Update(news);
        await _uow.SaveChangesAsync(ct);
        return true;
    }
}

public record DeleteNewsCommand(int Id) : IRequest;

public class DeleteNewsCommandHandler : IRequestHandler<DeleteNewsCommand>
{
    private readonly IUnitOfWork _uow;

    public DeleteNewsCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeleteNewsCommand request, CancellationToken ct)
    {
        var news = await _uow.News.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(News), request.Id);

        _uow.News.Remove(news);
        await _uow.SaveChangesAsync(ct);
    }
}