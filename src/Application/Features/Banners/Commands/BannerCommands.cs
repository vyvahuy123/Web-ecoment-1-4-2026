using Application.Features.Banners.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Banners.Commands;

public record CreateBannerCommand(
    string Tag, string Title, string Description,
    string ButtonText, string ButtonHref,
    string? ImageUrl, string BackgroundColor, int SortOrder, string Type = "hero"
) : IRequest<BannerDto>;

public record UpdateBannerCommand(
    Guid Id, string Tag, string Title, string Description,
    string ButtonText, string ButtonHref,
    string? ImageUrl, string BackgroundColor, int SortOrder, bool IsActive, string Type = "hero"
) : IRequest<BannerDto>;

public record DeleteBannerCommand(Guid Id) : IRequest;

public class CreateBannerCommandHandler : IRequestHandler<CreateBannerCommand, BannerDto>
{
    private readonly IUnitOfWork _uow;
    public CreateBannerCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<BannerDto> Handle(CreateBannerCommand req, CancellationToken ct)
    {
        var banner = Banner.Create(req.Tag, req.Title, req.Description,
            req.ButtonText, req.ButtonHref, req.ImageUrl, req.BackgroundColor, req.SortOrder, req.Type);
        _uow.Banners.Add(banner);
        await _uow.SaveChangesAsync(ct);
        return new BannerDto
        {
            Id = banner.Id, Tag = banner.Tag, Title = banner.Title,
            Description = banner.Description, ButtonText = banner.ButtonText,
            ButtonHref = banner.ButtonHref, ImageUrl = banner.ImageUrl,
            BackgroundColor = banner.BackgroundColor, SortOrder = banner.SortOrder,
            IsActive = banner.IsActive, Type = banner.Type, CreatedAt = banner.CreatedAt,
        };
    }
}

public class UpdateBannerCommandHandler : IRequestHandler<UpdateBannerCommand, BannerDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateBannerCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<BannerDto> Handle(UpdateBannerCommand req, CancellationToken ct)
    {
        var banner = await _uow.Banners.GetByIdAsync(req.Id, ct)
            ?? throw new Exception("Banner not found");
        banner.Update(req.Tag, req.Title, req.Description,
            req.ButtonText, req.ButtonHref, req.ImageUrl, req.BackgroundColor, req.SortOrder, req.Type);
        banner.SetActive(req.IsActive);
        _uow.Banners.Update(banner);
        await _uow.SaveChangesAsync(ct);
        return new BannerDto
        {
            Id = banner.Id, Tag = banner.Tag, Title = banner.Title,
            Description = banner.Description, ButtonText = banner.ButtonText,
            ButtonHref = banner.ButtonHref, ImageUrl = banner.ImageUrl,
            BackgroundColor = banner.BackgroundColor, SortOrder = banner.SortOrder,
            IsActive = banner.IsActive, Type = banner.Type, CreatedAt = banner.CreatedAt,
        };
    }
}

public class DeleteBannerCommandHandler : IRequestHandler<DeleteBannerCommand>
{
    private readonly IUnitOfWork _uow;
    public DeleteBannerCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeleteBannerCommand req, CancellationToken ct)
    {
        var banner = await _uow.Banners.GetByIdAsync(req.Id, ct)
            ?? throw new Exception("Banner not found");
        _uow.Banners.Remove(banner);
        await _uow.SaveChangesAsync(ct);
    }
}