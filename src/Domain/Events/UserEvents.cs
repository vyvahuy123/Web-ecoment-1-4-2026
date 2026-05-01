using Domain.Common;

namespace Domain.Events;

public record UserCreatedEvent(Guid UserId, string Username, string Email) : IDomainEvent;
public record UserDeactivatedEvent(Guid UserId) : IDomainEvent;
public record UserLoggedInEvent(Guid UserId, DateTime At) : IDomainEvent;
public record UserActivatedEvent(Guid UserId) : IDomainEvent;
