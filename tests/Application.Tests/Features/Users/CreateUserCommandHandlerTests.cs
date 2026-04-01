using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Users.Commands;
using Domain.Entities;
using Domain.Interfaces;
using FluentAssertions;
using NSubstitute;

namespace Application.Tests.Features.Users;

public class CreateUserCommandHandlerTests
{
    // ── Mocks ─────────────────────────────────────────────────────────────────
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IUserRepository _userRepo = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly CreateUserCommandHandler _sut;

    public CreateUserCommandHandlerTests()
    {
        _uow.Users.Returns(_userRepo);
        _hasher.Hash(Arg.Any<string>()).Returns("hashed_password");
        _sut = new CreateUserCommandHandler(_uow, _hasher);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateUserAndReturnDto()
    {
        // Arrange
        _userRepo.ExistsByEmailAsync(Arg.Any<string>()).Returns(false);
        _userRepo.ExistsByUsernameAsync(Arg.Any<string>()).Returns(false);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        var command = new CreateUserCommand("johndoe", "john@example.com", "Password1!", "John Doe");

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Username.Should().Be("johndoe");
        result.Email.Should().Be("john@example.com");
        result.FullName.Should().Be("John Doe");
        result.IsActive.Should().BeTrue();

        _userRepo.Received(1).Add(Arg.Any<User>());
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ShouldThrowConflictException()
    {
        // Arrange
        _userRepo.ExistsByEmailAsync(Arg.Any<string>()).Returns(true);

        var command = new CreateUserCommand("johndoe", "existing@example.com", "Password1!");

        // Act
        var act = async () => await _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*existing@example.com*");

        _userRepo.DidNotReceive().Add(Arg.Any<User>());
    }

    [Fact]
    public async Task Handle_WithDuplicateUsername_ShouldThrowConflictException()
    {
        // Arrange
        _userRepo.ExistsByEmailAsync(Arg.Any<string>()).Returns(false);
        _userRepo.ExistsByUsernameAsync(Arg.Any<string>()).Returns(true);

        var command = new CreateUserCommand("existinguser", "new@example.com", "Password1!");

        // Act
        var act = async () => await _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*existinguser*");
    }

    [Fact]
    public async Task Handle_ShouldHashPassword_BeforeCreatingUser()
    {
        // Arrange
        _userRepo.ExistsByEmailAsync(Arg.Any<string>()).Returns(false);
        _userRepo.ExistsByUsernameAsync(Arg.Any<string>()).Returns(false);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        var command = new CreateUserCommand("johndoe", "john@example.com", "PlainPassword1!");

        // Act
        await _sut.Handle(command, CancellationToken.None);

        // Assert - password được hash trước khi lưu
        _hasher.Received(1).Hash("PlainPassword1!");
    }
}
