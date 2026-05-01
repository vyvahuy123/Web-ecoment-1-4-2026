using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _ctx;
    public UserRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _ctx.Users.FirstOrDefaultAsync(u => u.Email.Value == email.ToLower(), ct);

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
        => await _ctx.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower(), ct);

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
        => await _ctx.Users.AnyAsync(u => u.Email.Value == email.ToLower(), ct);

    public async Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default)
        => await _ctx.Users.AnyAsync(u => u.Username == username.ToLower(), ct);

    public async Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var query = _ctx.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u =>
                u.Username.Contains(s) ||
                u.Email.Value.Contains(s) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)));
        }
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public void Add(User user) => _ctx.Users.Add(user);
    public void Update(User user) => _ctx.Users.Update(user);
    public void Remove(User user) => _ctx.Users.Remove(user);

    public async Task<IEnumerable<User>> GetAdminsAsync(CancellationToken ct = default)
    {
        var users = await _ctx.Users.Where(u => u.IsActive).ToListAsync(ct);
        return users.Where(u => u.Roles.Contains("Admin"));
    }

    public async Task<int> GetTotalCustomersAsync(CancellationToken ct = default)
    {
        var users = await _ctx.Users.Where(u => u.IsActive).ToListAsync(ct);
        return users.Count(u => !u.Roles.Contains("Admin"));
    }

    public async Task<int> GetNewCustomersAsync(int year, int? quarter, CancellationToken ct = default)
    {
        var query = _ctx.Users.Where(u => u.CreatedAt.Year == year && u.IsActive);
        if (quarter.HasValue)
        {
            var startMonth = (quarter.Value - 1) * 3 + 1;
            var endMonth = startMonth + 2;
            query = query.Where(u => u.CreatedAt.Month >= startMonth && u.CreatedAt.Month <= endMonth);
        }
        var users = await query.ToListAsync(ct);
        return users.Count(u => !u.Roles.Contains("Admin"));
    }
}