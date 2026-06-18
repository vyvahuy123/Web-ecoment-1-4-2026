using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Đánh giá sản phẩm — chỉ user đã mua mới được review
/// </summary>
public class Review : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid? OrderId { get; private set; }           // Chứng minh đã mua hàng
    public int Rating { get; private set; }             // 1–5 sao
    public string? Comment { get; private set; }
    public string? ImageUrls { get; private set; }      // JSON array ảnh đính kèm (tuỳ chọn)
    public ReviewStatus Status { get; private set; } = ReviewStatus.Pending;
    public string? AdminReply { get; private set; }     // Shop phản hồi
    public DateTime? RepliedAt { get; private set; }

    // Navigation
    public Product Product { get; private set; } = null!;
    public User User { get; private set; } = null!;
    public Order Order { get; private set; } = null!;

    private Review() { }

    public static Review Create(
        Guid productId,
        Guid userId,
        Guid? orderId,
        int rating,
        string? comment = null,
        string? imageUrls = null)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating phải từ 1 đến 5 sao.");
        return new Review
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            UserId = userId,
            OrderId = orderId,
            Rating = rating,
            Comment = comment,
            ImageUrls = imageUrls,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Approve() { Status = ReviewStatus.Approved; UpdatedAt = DateTime.UtcNow; }
    public void Reject() { Status = ReviewStatus.Rejected; UpdatedAt = DateTime.UtcNow; }

    public void Reply(string adminReply)
    {
        AdminReply = adminReply;
        RepliedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(int rating, string? comment, string? imageUrls)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating phải từ 1 đến 5 sao.");
        Rating = rating;
        Comment = comment;
        ImageUrls = imageUrls;
        Status = ReviewStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete() { IsDeleted = true; UpdatedAt = DateTime.UtcNow; }
}