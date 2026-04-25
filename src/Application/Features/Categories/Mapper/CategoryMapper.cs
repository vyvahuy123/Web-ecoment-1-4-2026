using Application.Categories.DTOs;
using Domain.Entities;

namespace Application.Categories.Mapper;

public static class CategoryMapper
{
    public static CategoryDto ToDto(this Category category) =>
        new(
            category.Id,
            category.Name,
            category.Description
        );
}