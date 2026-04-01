using Domain.Entities;
using Domain.Events;
using FluentAssertions;

namespace Domain.Tests;

public class UserTests
{
    // ── Create ────────────────────────────────────────────────────────────────
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var result = User.Create("johndoe", "john@example.com", "hashed_pw", "John Doe");

        result.IsSuccess.Should().BeTrue();
        result.Value.Username.Should().Be("johndoe");
        result.Value.Email.Value.Should().Be("john@example.com");
        result.Value.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_ShouldRaise_UserCreatedEvent()
    {
        var result = User.Create("johndoe", "john@example.com", "hashed_pw");

        result.Value.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserCreatedEvent>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("ab")] // too short
    public void Create_WithInvalidUsername_ShouldFail(string username)
    {
        var result = User.Create(username, "john@example.com", "hashed_pw");

        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("missing@")]
    [InlineData("@nodomain.com")]
    public void Create_WithInvalidEmail_ShouldFail(string email)
    {
        var result = User.Create("johndoe", email, "hashed_pw");

        result.IsFailure.Should().BeTrue();
    }

    // ── UpdateProfile ─────────────────────────────────────────────────────────
    [Fact]
    public void UpdateProfile_WithValidEmail_ShouldUpdateEmail()
    {
        var user = User.Create("johndoe", "john@example.com", "hashed_pw").Value;

        var result = user.UpdateProfile("John Updated", "new@example.com");

        result.IsSuccess.Should().BeTrue();
        user.Email.Value.Should().Be("new@example.com");
        user.FullName.Should().Be("John Updated");
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateProfile_WithInvalidEmail_ShouldFail()
    {
        var user = User.Create("johndoe", "john@example.com", "hashed_pw").Value;

        var result = user.UpdateProfile(null, "bad-email");

        result.IsFailure.Should().BeTrue();
        user.Email.Value.Should().Be("john@example.com"); // unchanged
    }

    // ── Deactivate ────────────────────────────────────────────────────────────
    [Fact]
    public void Deactivate_ShouldSetIsActiveFalse_AndRaiseEvent()
    {
        var user = User.Create("johndoe", "john@example.com", "hashed_pw").Value;
        user.ClearDomainEvents();

        user.Deactivate();

        user.IsActive.Should().BeFalse();
        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserDeactivatedEvent>();
    }

    // ── RecordLogin ───────────────────────────────────────────────────────────
    [Fact]
    public void RecordLogin_ShouldUpdateLastLoginAt()
    {
        var user = User.Create("johndoe", "john@example.com", "hashed_pw").Value;
        var before = DateTime.UtcNow;

        user.RecordLogin();

        user.LastLoginAt.Should().NotBeNull();
        user.LastLoginAt.Should().BeOnOrAfter(before);
    }
}
