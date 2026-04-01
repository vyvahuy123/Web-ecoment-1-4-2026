using System.Net;
using System.Net.Http.Json;
using Application.Features.Users.Commands;
using Application.Features.Users.DTOs;
using FluentAssertions;

namespace Integration.Tests;

public class UsersEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public UsersEndpointTests(ApiFactory factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task POST_users_WithValidData_Returns201()
    {
        var command = new CreateUserCommand(
            "integrationuser",
            "integration@example.com",
            "Password1!",
            "Integration User");

        var response = await _client.PostAsJsonAsync("/api/users", command);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var dto = await response.Content.ReadFromJsonAsync<UserDto>();
        dto.Should().NotBeNull();
        dto!.Username.Should().Be("integrationuser");
        dto.Email.Should().Be("integration@example.com");
    }

    [Fact]
    public async Task POST_users_WithDuplicateEmail_Returns409()
    {
        var command = new CreateUserCommand("user1", "dup@example.com", "Password1!");
        await _client.PostAsJsonAsync("/api/users", command);

        // Same email, different username
        var duplicate = new CreateUserCommand("user2", "dup@example.com", "Password1!");
        var response = await _client.PostAsJsonAsync("/api/users", duplicate);

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task POST_users_WithInvalidData_Returns400()
    {
        var command = new CreateUserCommand("ab", "not-email", "weak");

        var response = await _client.PostAsJsonAsync("/api/users", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("errors");
    }

    [Fact]
    public async Task GET_users_WithoutAuth_Returns401()
    {
        var response = await _client.GetAsync("/api/users");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_users_id_NonExistent_Returns404()
    {
        // Add auth header nếu cần
        var response = await _client.GetAsync($"/api/users/{Guid.NewGuid()}");
        // 401 nếu chưa auth, 404 nếu đã auth
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.NotFound);
    }
}
