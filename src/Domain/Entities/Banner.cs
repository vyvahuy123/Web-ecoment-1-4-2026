using Domain.Common;

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
    public string Type { get; private set; } = "hero";

    private Banner() { }

    public static Banner Create(string tag, string title, string description,
        string buttonText, string buttonHref, string? imageUrl,
        string backgroundColor, int sortOrder, string type = "hero")
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
            Type = type,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

    public void Update(string tag, string title, string description,
        string buttonText, string buttonHref, string? imageUrl,
        string backgroundColor, int sortOrder, string type = "hero")
    {
        Tag = tag;
        Title = title;
        Description = description;
        ButtonText = buttonText;
        ButtonHref = buttonHref;
        ImageUrl = imageUrl;
        BackgroundColor = backgroundColor;
        SortOrder = sortOrder;
        Type = type;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}