namespace Application.Features.Dashboard.DTOs;

public class DashboardStatsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal CompletionRate { get; set; }
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
    public List<QuarterlyRevenueDto> QuarterlyRevenue { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<PaymentMethodDto> PaymentMethods { get; set; } = new();
    public List<OrderStatusDto> OrderStatuses { get; set; } = new();
}

public class MonthlyRevenueDto
{
    public int Month { get; set; }
    public string MonthName { get; set; } = "";
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class QuarterlyRevenueDto
{
    public int Quarter { get; set; }
    public string Label { get; set; } = "";
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string? ImageUrl { get; set; }
    public int TotalSold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class PaymentMethodDto
{
    public string Method { get; set; } = "";
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class OrderStatusDto
{
    public string Status { get; set; } = "";
    public int Count { get; set; }
}