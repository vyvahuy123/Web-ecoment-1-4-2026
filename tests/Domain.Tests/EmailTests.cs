using Domain.ValueObjects;
using FluentAssertions;

namespace Domain.Tests;

public class EmailTests
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("USER@EXAMPLE.COM")]  // normalize to lowercase
    [InlineData("user+tag@sub.domain.io")]
    public void Create_WithValidEmail_ShouldSucceed(string email)
    {
        var result = Email.Create(email);

        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be(email.ToLower());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("notanemail")]
    [InlineData("@nodomain")]
    [InlineData("noatsign.com")]
    public void Create_WithInvalidEmail_ShouldFail(string? email)
    {
        var result = Email.Create(email);

        result.IsFailure.Should().BeTrue();
    }

    [Fact]
    public void TwoEmails_WithSameValue_ShouldBeEqual()
    {
        var e1 = Email.Create("test@example.com").Value;
        var e2 = Email.Create("TEST@EXAMPLE.COM").Value;

        e1.Should().Be(e2);
        (e1 == e2).Should().BeTrue();
    }

    [Fact]
    public void TwoEmails_WithDifferentValues_ShouldNotBeEqual()
    {
        var e1 = Email.Create("a@example.com").Value;
        var e2 = Email.Create("b@example.com").Value;

        e1.Should().NotBe(e2);
    }
}
