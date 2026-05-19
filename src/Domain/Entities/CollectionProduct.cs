namespace Domain.Entities;

public sealed class CollectionProduct
{
    public Guid CollectionId { get; private set; }
    public Guid ProductId { get; private set; }

    public Collection Collection { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    private CollectionProduct() { }

    public static CollectionProduct Create(Guid collectionId, Guid productId) =>
        new() { CollectionId = collectionId, ProductId = productId };
}
