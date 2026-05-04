using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

public class Banner : BaseEntity
{
    public string Tag { get; private set; } = "";
    public string Title { get; private set; } = "";
    public string Description { get; private set; } = "";
    public string ButtonText { get; private set; } = "";
    public string ButtonHref { get; private set; } = "#products";
    public string? ImageUrl { get; private set; }
    public string BackgroundColor { get; private set; } = "#f0f0f0";
    public int SortOrder { get; private set; } = 0;
    public bool IsActive { get; private set; } = true;

    private Banner() { }

    public static Banner Create(string tag, string title, string description,
        string buttonText, string buttonHref, string? imageUrl, string backgroundColor, int sortOrder)
        => new()
        {
            Id = Guid.NewGuid(),
            Tag = tag,
            Title = title,
            Description = description,
            ButtonText = buttonText,
            ButtonHref = buttonHref,
            ImageUrl = imageUrl,
            BackgroundColor = backgroundColor,
            SortOrder = sortOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

    public void Update(string tag, string title, string description,
        string buttonText, string buttonHref, string? imageUrl, string backgroundColor, int sortOrder)
    {
        Tag = tag;
        Title = title;
        Description = description;
        ButtonText = buttonText;
        ButtonHref = buttonHref;
        ImageUrl = imageUrl;
        BackgroundColor = backgroundColor;
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
