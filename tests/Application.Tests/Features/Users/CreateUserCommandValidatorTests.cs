using Application.Features.Users.Commands;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace Application.Tests.Features.Users;

public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ShouldPass()
    {
        var cmd = new CreateUserCommand("johndoe", "john@example.com", "Password1!");
        var result = _validator.TestValidate(cmd);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]                   // too short
    [InlineData("this_username_is_way_too_long_to_be_valid_in_our_system_ok")]
    [InlineData("has space")]
    [InlineData("has@special!")]
    public void Validate_WithInvalidUsername_ShouldFail(string username)
    {
        var cmd = new CreateUserCommand(username, "john@example.com", "Password1!");
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Theory]
    [InlineData("")]
    [InlineData("notanemail")]
    [InlineData("missing@")]
    public void Validate_WithInvalidEmail_ShouldFail(string email)
    {
        var cmd = new CreateUserCommand("johndoe", email, "Password1!");
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData("short1")]      // too short
    [InlineData("alllowercase1!")]  // no uppercase
    [InlineData("NoNumbers!!!")]    // no number
    public void Validate_WithWeakPassword_ShouldFail(string password)
    {
        var cmd = new CreateUserCommand("johndoe", "john@example.com", password);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
