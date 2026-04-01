using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseSqlServer(
    @"Server=LAPTOP-2LEA9U48\SQLEXPRESS;Database=clean_arch_dev;Trusted_Connection=True;TrustServerCertificate=True;");

        return new AppDbContext(optionsBuilder.Options, new NoOpMediator());
    }
}

internal class NoOpMediator : MediatR.IMediator
{
    public Task<TResponse> Send<TResponse>(MediatR.IRequest<TResponse> request, CancellationToken ct = default)
        => Task.FromResult<TResponse>(default!);

    public Task Send<TRequest>(TRequest request, CancellationToken ct = default)
        where TRequest : MediatR.IRequest
        => Task.CompletedTask;

    public Task<object?> Send(object request, CancellationToken ct = default)
        => Task.FromResult<object?>(null);

    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(MediatR.IStreamRequest<TResponse> request, CancellationToken ct = default)
        => throw new NotImplementedException();

    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken ct = default)
        => throw new NotImplementedException();

    public Task Publish(object notification, CancellationToken ct = default)
        => Task.CompletedTask;

    public Task Publish<TNotification>(TNotification notification, CancellationToken ct = default)
        where TNotification : MediatR.INotification
        => Task.CompletedTask;
}