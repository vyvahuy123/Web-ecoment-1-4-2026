using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Order?> GetByOrderCodeAsync(string orderCode, CancellationToken ct = default);
    Task<(IEnumerable<Order> Items, int Total)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<(IEnumerable<Order> Items, int Total)> GetPagedAsync(
        int page, int pageSize, OrderStatus? status = null, CancellationToken ct = default);
    void Add(Order order);
    void Update(Order order);
}

public interface IAddressRepository
{
    Task<Address?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<Address?> GetDefaultByUserIdAsync(Guid userId, CancellationToken ct = default);
    void Add(Address address);
    void Update(Address address);
    void Remove(Address address);
}

public interface IVoucherRepository
{
    Task<Voucher?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Voucher?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<(IEnumerable<Voucher> Items, int Total)> GetPagedAsync(
        int page, int pageSize, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken ct = default);
    void Add(Voucher voucher);
    void Update(Voucher voucher);
}

public interface IVoucherUsageRepository
{
    Task<int> CountByUserAndVoucherAsync(Guid userId, Guid voucherId, CancellationToken ct = default);
    void Add(VoucherUsage usage);
}