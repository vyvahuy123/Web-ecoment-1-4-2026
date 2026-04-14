using MediatR;
using Domain.Common;
using Domain.Interfaces;

namespace Application.Categories.Commands.UpdateCategory;

public sealed record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description
) : IRequest<Result>;

public sealed class UpdateCategoryCommandHandler
    : IRequestHandler<UpdateCategoryCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public UpdateCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(
        UpdateCategoryCommand request,
        CancellationToken ct)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Failure("Không tìm thấy danh mục.");

        var updateResult = category.Update(request.Name, request.Description);
        if (updateResult.IsFailure)
            return updateResult;

        _uow.Categories.Update(category);
        await _uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}