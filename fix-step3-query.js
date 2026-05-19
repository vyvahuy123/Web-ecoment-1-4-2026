const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Queries/GetProductQueries.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `    public async Task<PagedResult<ProductSummaryDto>> Handle(GetProductsQuery req, CancellationToken ct)
    {
        var (items, total) = await _uow.Products.GetPagedAsync(
            req.Page, req.PageSize, req.Search, req.CategoryId, ct);
        return new PagedResult<ProductSummaryDto>(
            items.Select(ProductMapper.ToSummary), total, req.Page, req.PageSize);
    }`,
  `    public async Task<PagedResult<ProductSummaryDto>> Handle(GetProductsQuery req, CancellationToken ct)
    {
        var (items, total) = await _uow.Products.GetPagedAsync(
            req.Page, req.PageSize, req.Search, req.CategoryId, ct);

        var summaries = new List<ProductSummaryDto>();
        foreach (var p in items)
        {
            var cols = await _uow.Collections.GetCollectionsByProductIdAsync(p.Id, ct);
            summaries.Add(ProductMapper.ToSummary(p, cols));
        }
        return new PagedResult<ProductSummaryDto>(summaries, total, req.Page, req.PageSize);
    }`
);

code = code.replace(
  `    public async Task<ProductDto> Handle(GetProductByIdQuery req, CancellationToken ct)
    {
        var p = await _uow.Products.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), req.Id);
        return ProductMapper.ToDto(p);
    }`,
  `    public async Task<ProductDto> Handle(GetProductByIdQuery req, CancellationToken ct)
    {
        var p = await _uow.Products.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), req.Id);
        var cols = await _uow.Collections.GetCollectionsByProductIdAsync(p.Id, ct);
        return ProductMapper.ToDto(p, cols);
    }`
);

// Add List using
if (!code.includes('using System.Collections.Generic;'))
    code = 'using System.Collections.Generic;\n' + code;

fs.writeFileSync(path, code);
console.log('Done');
