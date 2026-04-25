using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly AppDbContext _ctx;
    public AddressRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Address?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Addresses.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Addresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

    public async Task<Address?> GetDefaultByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Addresses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault, ct);

    public void Add(Address address) => _ctx.Addresses.Add(address);
    public void Update(Address address) => _ctx.Addresses.Update(address);
    public void Remove(Address address) => _ctx.Addresses.Remove(address);
}