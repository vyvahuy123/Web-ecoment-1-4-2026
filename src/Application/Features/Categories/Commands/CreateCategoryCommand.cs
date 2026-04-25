using MediatR;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Categories.Commands.CreateCategory;

public sealed record CreateCategoryCommand(
    string Name,
    string? Description
) : IRequest<Result<Guid>>;

public sealed class CreateCategoryCommandHandler
    : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    private readonly IUnitOfWork _uow;

    public CreateCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<Guid>> Handle(
        CreateCategoryCommand request,
        CancellationToken ct)
    {
        var result = Category.Create(request.Name, request.Description);
        if (result.IsFailure)
            return Result.Failure<Guid>(result.Error);

        await _uow.Categories.AddAsync(result.Value, ct);
        await _uow.SaveChangesAsync(ct);

        return Result.Success(result.Value.Id);
    }
}