using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Banners.DTOs;

public class BannerDto
{
    public Guid Id { get; set; }
    public string Tag { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string ButtonText { get; set; } = "";
    public string ButtonHref { get; set; } = "";
    public string? ImageUrl { get; set; }
    public string BackgroundColor { get; set; } = "";
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
