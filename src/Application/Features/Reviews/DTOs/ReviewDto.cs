using Domain.Enums;

namespace Application.Features.Reviews.DTOs;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? ImageUrls { get; set; }
    public string? AdminReply { get; set; }
    public ReviewStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}