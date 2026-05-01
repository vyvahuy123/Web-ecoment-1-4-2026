using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Features.News.DTOs;
using Domain.Entities;

namespace Application.Features.News;

public static class NewsMapper
{
    public static NewsDto ToDto(this Domain.Entities.News news) => new()
    {
        Id = news.Id,
        Title = news.Title,
        Description = news.Description,
        Content = news.Content,
        ImageUrl = news.ImageUrl,
        Category = news.Category,
        IsPublished = news.IsPublished,
        CreatedAt = news.CreatedAt,
        UpdatedAt = news.UpdatedAt
    };

    public static NewsListDto ToListDto(this Domain.Entities.News news) => new()
    {
        Id = news.Id,
        Title = news.Title,
        Description = news.Description,
        ImageUrl = news.ImageUrl,
        Category = news.Category,
        IsPublished = news.IsPublished,
        CreatedAt = news.CreatedAt
    };

    public static Domain.Entities.News ToEntity(this CreateNewsDto dto) => new()
    {
        Title = dto.Title,
        Description = dto.Description,
        Content = dto.Content,
        ImageUrl = dto.ImageUrl,
        Category = dto.Category,
        IsPublished = dto.IsPublished,
        CreatedAt = DateTime.UtcNow
    };
}