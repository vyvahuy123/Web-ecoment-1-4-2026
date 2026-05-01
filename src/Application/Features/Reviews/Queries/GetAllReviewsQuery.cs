using Application.Features.Reviews.DTOs;
using Application.Features.Reviews.Mapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reviews.Queries;

public record GetAllReviewsQuery : IRequest<List<ReviewDto>>;

public class GetAllReviewsQueryHandler : IRequestHandler<GetAllReviewsQuery, List<ReviewDto>>
{
    private readonly IUnitOfWork _uow;
    public GetAllReviewsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<ReviewDto>> Handle(GetAllReviewsQuery request, CancellationToken ct)
    {
        var reviews = await _uow.Reviews.GetAllAsync(ct);
        return reviews.Select(ReviewMapper.ToDto).ToList();
    }
}