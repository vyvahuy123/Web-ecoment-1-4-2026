using Application.Common.Interfaces;
using Application.Common.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest<bool>;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;

    public ResetPasswordCommandHandler(IUnitOfWork uow, IPasswordHasher hasher)
    {
        _uow = uow;
        _hasher = hasher;
    }

    public async Task<bool> Handle(ResetPasswordCommand req, CancellationToken ct)
    {
        var user = await _uow.Users.GetByEmailAsync(req.Email, ct)
            ?? throw new NotFoundException("User", req.Email);

        if (!user.IsPasswordResetTokenValid(req.Token))
            throw new Exception("Ma xac nhan khong hop le hoac da het han.");

        var newHash = _hasher.Hash(req.NewPassword);
        var result = user.ResetPassword(newHash);
        if (result.IsFailure)
            throw new Exception(result.Error);

        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
        return true;
    }
}
