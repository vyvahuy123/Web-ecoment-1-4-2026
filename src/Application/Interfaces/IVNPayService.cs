using Microsoft.AspNetCore.Http;

namespace Application.Interfaces;

public class VNPayRequest
{
    public string OrderCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string OrderInfo { get; set; } = string.Empty;
    public Guid PaymentId { get; set; }
}

public class VNPayResponse
{
    public bool IsSuccess { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string OrderCode { get; set; } = string.Empty;
    public string ResponseCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid PaymentId { get; set; }
}

public interface IVNPayService
{
    string CreatePaymentUrl(VNPayRequest request, HttpContext context);
    VNPayResponse ProcessCallback(IQueryCollection query);
}
