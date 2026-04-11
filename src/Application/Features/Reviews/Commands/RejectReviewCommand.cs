using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reviews.Commands;

public record RejectReviewCommand(Guid ReviewId) : IRequest;

public class RejectReviewCommandHandler
{
    private readonly IUnitOfWork _uow;
    public RejectReviewCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(RejectReviewCommand request, CancellationToken ct)
    {
        var review = await _uow.Reviews.GetByIdAsync(request.ReviewId)
            ?? throw new Exception("Review not found.");

        review.Reject();
        await _uow.SaveChangesAsync(ct);
    }
}