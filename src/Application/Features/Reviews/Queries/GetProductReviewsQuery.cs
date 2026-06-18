using Application.Common.Interfaces;
using Application.Features.Reviews.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reviews.Queries;

public record GetProductReviewsQuery(Guid ProductId, int Page, int PageSize)
    : IRequest<List<ReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, List<ReviewDto>>
{
    private readonly IUnitOfWork _uow;
    public GetProductReviewsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<ReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken ct)
    {
        var reviews = await _uow.Reviews.GetApprovedByProductIdAsync(
            request.ProductId, request.Page, request.PageSize);

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            UserId = r.UserId,
            OrderId = r.OrderId,
            UserName = r.User?.FullName ?? string.Empty,
            Rating = r.Rating,
            Comment = r.Comment,
            ImageUrls = r.ImageUrls,
            AdminReply = r.AdminReply,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        }).ToList();
    }
}