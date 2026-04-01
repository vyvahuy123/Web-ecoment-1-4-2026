using Domain.Common;

namespace Domain.Events;

public record ProductCreatedEvent(Guid ProductId, string Name) : IDomainEvent;
public record ProductStockChangedEvent(Guid ProductId, int OldStock, int NewStock) : IDomainEvent;
