using Application.Common;
using Application.Common.Exceptions;
using Application.Features.Users.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Users.Queries;

// ── Get by ID ─────────────────────────────────────────────────────────────────
public record GetUserByIdQuery(Guid Id) : IRequest<UserDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IUnitOfWork _uow;
    public GetUserByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.Id);

        return new UserDto(user.Id, user.Username, user.Email.Value,
            user.FullName, user.IsActive, user.CreatedAt, user.LastLoginAt, user.Roles);
    }
}

// ── Get Paged List ────────────────────────────────────────────────────────────
public record GetUsersQuery(int Page = 1, int PageSize = 20, string? Search = null)
    : IRequest<PagedResult<UserSummaryDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PagedResult<UserSummaryDto>>
{
    private readonly IUnitOfWork _uow;
    public GetUsersQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<UserSummaryDto>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var (items, total) = await _uow.Users.GetPagedAsync(
            request.Page, request.PageSize, request.Search, ct);

        var dtos = items.Select(u =>
        new UserSummaryDto(u.Id, u.Username, u.Email.Value, u.FullName, u.IsActive, u.Roles));

        return new PagedResult<UserSummaryDto>(dtos, total, request.Page, request.PageSize);
    }
}
