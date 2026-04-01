namespace Domain.Common;

/// <summary>
/// Marker interface for Domain Events
/// </summary>
public interface IDomainEvent { }

/// <summary>
/// Entity có audit fields (CreatedBy, UpdatedBy)
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
