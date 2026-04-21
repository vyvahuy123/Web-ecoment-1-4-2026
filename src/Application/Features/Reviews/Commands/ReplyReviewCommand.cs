using Domain.Interfaces;
using MediatR;

namespace Application.Features.Reviews.Commands;

public record ReplyReviewCommand(Guid ReviewId, string AdminReply) : IRequest;

public class ReplyReviewCommandHandler : IRequestHandler<ReplyReviewCommand>
{
    private readonly IUnitOfWork _uow;
    public ReplyReviewCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(ReplyReviewCommand request, CancellationToken ct)
    {
        var review = await _uow.Reviews.GetByIdAsync(request.ReviewId)
            ?? throw new Exception("Review not found.");

        review.Reply(request.AdminReply);
        await _uow.SaveChangesAsync(ct);
    }
}