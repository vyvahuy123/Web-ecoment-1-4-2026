using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Users.Commands;

public record ChangePasswordCommand(Guid Id, string CurrentPassword, string NewPassword) : IRequest;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Vui lòng nhập mật khẩu hiện tại.");
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6).WithMessage("Mật khẩu mới tối thiểu 6 ký tự.");
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;

    public ChangePasswordCommandHandler(IUnitOfWork uow, IPasswordHasher hasher)
    {
        _uow = uow;
        _hasher = hasher;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.Id);

        var isValid = _hasher.Verify(request.CurrentPassword, user.PasswordHash);
        var result = user.ChangePassword(request.CurrentPassword, _hasher.Hash(request.NewPassword), isValid);

        if (result.IsFailure)
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("CurrentPassword", result.Error!) });

        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}
