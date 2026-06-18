using Domain.Enums;
using Domain.Interfaces;
using MediatR;
using Application.Features.Dashboard.DTOs;

namespace Application.Features.Dashboard.Queries;

public record GetDashboardStatsQuery(int Year, int? Quarter = null) : IRequest<DashboardStatsDto>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IUnitOfWork _uow;
    public GetDashboardStatsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery req, CancellationToken ct)
    {
        var year = req.Year;
        var quarter = req.Quarter;

        var orders = await _uow.Orders.GetAllForDashboardAsync(year, ct);

        var filtered = quarter.HasValue
            ? orders.Where(o => ((o.CreatedAt.Month - 1) / 3) + 1 == quarter.Value).ToList()
            : orders;

        var delivered = filtered.Where(o => o.Status == OrderStatus.Delivered).ToList();
        var totalRevenue = delivered.Sum(o => o.TotalAmount);
        var totalOrders = filtered.Count;
        var completionRate = totalOrders > 0 ? (decimal)delivered.Count / totalOrders * 100 : 0;

        var monthlyRevenue = Enumerable.Range(1, 12).Select(m =>
        {
            var mo = filtered.Where(o => o.CreatedAt.Month == m).ToList();
            var md = mo.Where(o => o.Status == OrderStatus.Delivered).ToList();
            return new MonthlyRevenueDto
            {
                Month = m,
                MonthName = $"T{m}",
                Revenue = md.Sum(o => o.TotalAmount),
                Orders = mo.Count
            };
        }).ToList();

        var quarterlyRevenue = Enumerable.Range(1, 4).Select(q =>
        {
            var months = Enumerable.Range((q - 1) * 3 + 1, 3);
            var qo = orders.Where(o => months.Contains(o.CreatedAt.Month)).ToList();
            var qd = qo.Where(o => o.Status == OrderStatus.Delivered).ToList();
            return new QuarterlyRevenueDto
            {
                Quarter = q,
                Label = $"Q{q}/{year}",
                Revenue = qd.Sum(o => o.TotalAmount),
                Orders = qo.Count
            };
        }).ToList();

        var topProducts = filtered
            .SelectMany(o => o.Items.Select(i => new { i.ProductId, i.ProductName, i.ProductImageUrl, i.Quantity, i.TotalPrice }))
            .GroupBy(i => new { i.ProductId, i.ProductName, i.ProductImageUrl })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                ImageUrl = g.Key.ProductImageUrl,
                TotalSold = g.Sum(i => i.Quantity),
                TotalRevenue = g.Sum(i => i.TotalPrice)
            })
            .OrderByDescending(p => p.TotalSold)
            .Take(5)
            .ToList();

        var paymentMethods = filtered
            .GroupBy(o => o.PaymentMethod.ToString())
            .Select(g => new PaymentMethodDto
            {
                Method = g.Key,
                Count = g.Count(),
                Amount = g.Where(o => o.Status == OrderStatus.Delivered).Sum(o => o.TotalAmount)
            }).ToList();

        var orderStatuses = filtered
            .GroupBy(o => o.Status.ToString())
            .Select(g => new OrderStatusDto
            {
                Status = g.Key,
                Count = g.Count()
            }).ToList();

        var totalCustomers = await _uow.Users.GetTotalCustomersAsync(ct);
        var newCustomers = await _uow.Users.GetNewCustomersAsync(year, quarter, ct);

        return new DashboardStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0,
            CompletionRate = completionRate,
            TotalCustomers = totalCustomers,
            NewCustomers = newCustomers,
            MonthlyRevenue = monthlyRevenue,
            QuarterlyRevenue = quarterlyRevenue,
            TopProducts = topProducts,
            PaymentMethods = paymentMethods,
            OrderStatuses = orderStatuses
        };
    }
}