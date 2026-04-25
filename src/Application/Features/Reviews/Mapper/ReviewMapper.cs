using Application.Features.Reviews.DTOs;
using Domain.Entities;

namespace Application.Features.Reviews.Mapper;

public static class ReviewMapper
{
    public static ReviewDto ToDto(Review r) => new()
    {
        Id = r.Id,
        ProductId = r.ProductId,
        UserId = r.UserId,
        OrderId = r.OrderId,
        UserName = r.User?.FullName ?? string.Empty,
        Rating = r.Rating,
        Comment = r.Comment,
        ImageUrls = r.ImageUrls,
        AdminReply = r.AdminReply,
        Status = r.Status,
        CreatedAt = r.CreatedAt
    };
}