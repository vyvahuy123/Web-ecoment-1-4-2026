using Application.Common.Exceptions;
using Application.Features.Users.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Features.Users.Commands;

// ── Command ──────────────────────────────────────────────────────────────────
public record CreateUserCommand(
    string Username,
    string Email,
    string Password,
    string? FullName
) : IRequest<UserDto>;

// ── Validator ─────────────────────────────────────────────────────────────────
public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username không được để trống.")
            .MinimumLength(3).WithMessage("Username tối thiểu 3 ký tự.")
            .MaximumLength(50).WithMessage("Username tối đa 50 ký tự.")
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username chỉ chứa chữ, số và dấu gạch dưới.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password không được để trống.")
            .MinimumLength(8).WithMessage("Password tối thiểu 8 ký tự.")
            .Matches("[A-Z]").WithMessage("Password cần ít nhất 1 chữ hoa.")
            .Matches("[0-9]").WithMessage("Password cần ít nhất 1 số.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserCommandHandler(IUnitOfWork uow, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        // 1. Kiểm tra trùng
        if (await _uow.Users.ExistsByEmailAsync(request.Email, ct))
            throw new ConflictException($"Email '{request.Email}' đã được sử dụng.");

        if (await _uow.Users.ExistsByUsernameAsync(request.Username, ct))
            throw new ConflictException($"Username '{request.Username}' đã tồn tại.");

        // 2. Hash password
        var passwordHash = _passwordHasher.Hash(request.Password);

        // 3. Tạo entity qua Factory Method (domain validates)
        var result = User.Create(request.Username, request.Email, passwordHash, request.FullName);
        if (result.IsFailure)
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("", result.Error!) });

        // 4. Persist
        _uow.Users.Add(result.Value);
        await _uow.SaveChangesAsync(ct);

        // 5. Map → DTO
        var user = result.Value;
        return new UserDto(user.Id, user.Username, user.Email.Value,
            user.FullName, user.IsActive, user.CreatedAt, user.LastLoginAt, user.Roles);
    }
}
