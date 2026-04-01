using Application.Common.Exceptions;
using Application.Features.Users.DTOs;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Users.Commands;

// ── Update Command ────────────────────────────────────────────────────────────
public record UpdateUserCommand(Guid Id, string? FullName, string? Email) : IRequest<UserDto>;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        When(x => x.Email is not null, () =>
            RuleFor(x => x.Email!).EmailAddress().WithMessage("Email không hợp lệ."));
    }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    private readonly IUnitOfWork _uow;

    public UpdateUserCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.Id);

        var result = user.UpdateProfile(request.FullName, request.Email);
        if (result.IsFailure)
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });

        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        return new UserDto(user.Id, user.Username, user.Email.Value,
            user.FullName, user.IsActive, user.CreatedAt, user.LastLoginAt, user.Roles);
    }
}

// ── Delete (Soft) Command ─────────────────────────────────────────────────────
public record DeactivateUserCommand(Guid Id) : IRequest;

public class DeactivateUserCommandHandler : IRequestHandler<DeactivateUserCommand>
{
    private readonly IUnitOfWork _uow;
    public DeactivateUserCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeactivateUserCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.Id);

        user.Deactivate();
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}
