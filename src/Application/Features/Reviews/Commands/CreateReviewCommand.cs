using Application.Features.Reviews.DTOs;
using Application.Features.Reviews.Mapper;
using Domain.Entities;
using Domain.Interfaces;
using Application.Common.Exceptions;
using MediatR;

namespace Application.Features.Reviews.Commands;

public record CreateReviewCommand(
    Guid UserId,
    Guid ProductId,
    Guid? OrderId,
    int Rating,
    string? Comment = null,
    string? ImageUrls = null) : IRequest<ReviewDto>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
{
    private readonly IUnitOfWork _uow;
    public CreateReviewCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken ct)
    {
        var alreadyReviewed = await _uow.Reviews.ExistsByUserAndProductAsync(request.UserId, request.ProductId);
        var hasPurchased = await _uow.Orders.HasUserPurchasedProductAsync(request.UserId, request.ProductId, ct);
        if (!hasPurchased)
            throw new ConflictException("Bạn chưa mua sản phẩm này.");
        if (alreadyReviewed)
            throw new ConflictException("Bạn đã đánh giá sản phẩm này rồi.");

        var review = Review.Create(
            request.ProductId,
            request.UserId,
            request.OrderId,
            request.Rating,
            request.Comment,
            request.ImageUrls);

        review.Approve();
        await _uow.Reviews.AddAsync(review);
        await _uow.SaveChangesAsync(ct);
        return ReviewMapper.ToDto(review);
    }
}