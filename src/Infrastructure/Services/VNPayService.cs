using System.Net;
using System.Security.Cryptography;
using System.Text;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class VNPayService : IVNPayService
{
    private readonly IConfiguration _config;

    public VNPayService(IConfiguration config) => _config = config;

    public string CreatePaymentUrl(VNPayRequest request, HttpContext context)
    {
        var vnpay = _config.GetSection("VNPay");
        var tmnCode = vnpay["TmnCode"]!;
        var hashSecret = vnpay["HashSecret"]!;
        var baseUrl = vnpay["BaseUrl"]!;
        var returnUrl = vnpay["ReturnUrl"]!;

        var tick = DateTime.UtcNow.AddHours(7);

        var data = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = tmnCode,
            ["vnp_Amount"] = ((long)(request.Amount * 100)).ToString(),
            ["vnp_CreateDate"] = tick.ToString("yyyyMMddHHmmss"),
            ["vnp_CurrCode"] = "VND",
            ["vnp_IpAddr"] = GetIpAddress(context),
            ["vnp_Locale"] = "vn",
            ["vnp_OrderInfo"] = request.OrderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_ReturnUrl"] = returnUrl,
            ["vnp_TxnRef"] = request.PaymentId.ToString("N"),
            ["vnp_ExpireDate"] = tick.AddMinutes(15).ToString("yyyyMMddHHmmss"),
        };

        var queryString = string.Join("&", data.Select(kv =>
            $"{kv.Key}={WebUtility.UrlEncode(kv.Value)}"));
        var signData = string.Join("&", data.Select(kv =>
            $"{kv.Key}={kv.Value}"));
        var signature = HmacSHA512(hashSecret, signData);

        return $"{baseUrl}?{queryString}&vnp_SecureHash={signature}";
    }

    public VNPayResponse ProcessCallback(IQueryCollection query)
    {
        var hashSecret = _config["VNPay:HashSecret"]!;

        var data = new SortedDictionary<string, string>();
        foreach (var (key, value) in query)
        {
            if (!key.StartsWith("vnp_") || key == "vnp_SecureHash") continue;
            data[key] = value!;
        }

        var signData = string.Join("&", data.Select(kv => $"{kv.Key}={kv.Value}"));
        var signature = HmacSHA512(hashSecret, signData);
        var receivedHash = query["vnp_SecureHash"].ToString();
        var responseCode = query["vnp_ResponseCode"].ToString();
        var txnRef = query["vnp_TxnRef"].ToString();
        var transId = query["vnp_TransactionNo"].ToString();

        Guid.TryParse(txnRef, out var paymentId);

        return new VNPayResponse
        {
            IsSuccess = signature == receivedHash && responseCode == "00",
            TransactionId = transId,
            OrderCode = query["vnp_OrderInfo"].ToString(),
            ResponseCode = responseCode,
            PaymentId = paymentId,
            Message = responseCode == "00" ? "Thanh toán thành công" : GetErrorMessage(responseCode),
        };
    }

    private static string HmacSHA512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return string.Concat(hash.Select(b => b.ToString("x2")));
    }

    private static string GetIpAddress(HttpContext context)
    {
        var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                 ?? context.Connection.RemoteIpAddress?.ToString()
                 ?? "127.0.0.1";
        return ip.Split(',')[0].Trim();
    }

    private static string GetErrorMessage(string code) => code switch
    {
        "07" => "Giao dịch bị nghi ngờ gian lận",
        "09" => "Thẻ/Tài khoản chưa đăng ký Internet Banking",
        "10" => "Xác thực thông tin thẻ/tài khoản quá 3 lần",
        "11" => "Đã hết hạn chờ thanh toán",
        "12" => "Thẻ/Tài khoản bị khóa",
        "13" => "Sai mật khẩu OTP",
        "24" => "Khách hàng hủy giao dịch",
        "51" => "Tài khoản không đủ số dư",
        "65" => "Vượt hạn mức giao dịch trong ngày",
        "75" => "Ngân hàng thanh toán đang bảo trì",
        "79" => "Sai mật khẩu thanh toán quá số lần quy định",
        _ => "Giao dịch thất bại"
    };
}
