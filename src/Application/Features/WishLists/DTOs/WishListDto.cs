namespace Application.Features.WishLists.DTOs;

public class WishListDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string? ProductImageUrl { get; set; }
    public DateTime AddedAt { get; set; }
}