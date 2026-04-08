using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reviews.Commands;

public record ApproveReviewCommand(Guid ReviewId) : IRequest;

public class ApproveReviewCommandHandler
{
    private readonly IUnitOfWork _uow;
    public ApproveReviewCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(ApproveReviewCommand request, CancellationToken ct)
    {
        var review = await _uow.Reviews.GetByIdAsync(request.ReviewId)
            ?? throw new Exception("Review not found.");

        review.Approve();
        await _uow.SaveChangesAsync(ct);
    }
}