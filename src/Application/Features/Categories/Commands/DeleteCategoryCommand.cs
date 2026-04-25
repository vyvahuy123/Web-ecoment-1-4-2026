using MediatR;
using Domain.Common;
using Domain.Interfaces;

namespace Application.Categories.Commands.DeleteCategory;

public sealed record DeleteCategoryCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteCategoryCommandHandler
    : IRequestHandler<DeleteCategoryCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(
        DeleteCategoryCommand request,
        CancellationToken ct)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Failure("Không tìm thấy danh mục.");

        _uow.Categories.Delete(category);
        await _uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}