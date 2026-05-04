using Application.Features.Banners.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Banners.Queries;

public record GetBannersQuery(bool ActiveOnly = true) : IRequest<List<BannerDto>>;

public class GetBannersQueryHandler : IRequestHandler<GetBannersQuery, List<BannerDto>>
{
    private readonly IUnitOfWork _uow;
    public GetBannersQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<BannerDto>> Handle(GetBannersQuery req, CancellationToken ct)
    {
        var banners = req.ActiveOnly
            ? await _uow.Banners.GetAllActiveAsync(ct)
            : await _uow.Banners.GetAllAsync(ct);

        return banners.Select(b => new BannerDto
        {
            Id = b.Id,
            Tag = b.Tag,
            Title = b.Title,
            Description = b.Description,
            ButtonText = b.ButtonText,
            ButtonHref = b.ButtonHref,
            ImageUrl = b.ImageUrl,
            BackgroundColor = b.BackgroundColor,
            SortOrder = b.SortOrder,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedAt,
        }).ToList();
    }
}