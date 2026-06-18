using Domain.Entities;

namespace Domain.Interfaces;

/// <summary>
/// Repository interface nằm ở Domain layer.
/// Infrastructure sẽ implement - Dependency Inversion Principle.
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default);
    Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default);
    void Add(User user);
    void Update(User user);
    void Remove(User user);
    Task<IEnumerable<Domain.Entities.User>> GetAdminsAsync(CancellationToken ct = default);
    Task<int> GetTotalCustomersAsync(CancellationToken ct = default);
    Task<int> GetNewCustomersAsync(int year, int? quarter, CancellationToken ct = default);
}