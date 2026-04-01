using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Địa chỉ giao hàng của User — một User có nhiều Address
/// </summary>
public class Address : BaseEntity
{
    public Guid UserId { get; private set; }
    public string FullName { get; private set; } = string.Empty;   // Tên người nhận
    public string Phone { get; private set; } = string.Empty;       // SĐT người nhận
    public string Province { get; private set; } = string.Empty;    // Tỉnh/Thành phố
    public string District { get; private set; } = string.Empty;    // Quận/Huyện
    public string Ward { get; private set; } = string.Empty;        // Phường/Xã
    public string Street { get; private set; } = string.Empty;      // Số nhà, tên đường
    public bool IsDefault { get; private set; } = false;            // Địa chỉ mặc định

    // Navigation
    public User User { get; private set; } = null!;

    private Address() { }

    public static Address Create(
        Guid userId,
        string fullName,
        string phone,
        string province,
        string district,
        string ward,
        string street,
        bool isDefault = false)
    {
        return new Address
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FullName = fullName,
            Phone = phone,
            Province = province,
            District = district,
            Ward = ward,
            Street = street,
            IsDefault = isDefault,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string fullName, string phone, string province,
        string district, string ward, string street)
    {
        FullName = fullName;
        Phone = phone;
        Province = province;
        District = district;
        Ward = ward;
        Street = street;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsDefault() => IsDefault = true;
    public void UnsetDefault() => IsDefault = false;
    public void Delete() { IsDeleted = true; UpdatedAt = DateTime.UtcNow; }
}