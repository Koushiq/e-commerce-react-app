using System.ComponentModel;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;

namespace Ecommerce.McpServer.Tools;

[McpServerToolType]
public class ProductSalesTools
{
    private readonly EcommerceDbContext _db;

    public ProductSalesTools(EcommerceDbContext db)
    {
        _db = db;
    }

    [McpServerTool(Name = "search_products"), Description("Search for products by name or SKU. Returns product IDs, names, SKUs, and prices.")]
    public async Task<string> SearchProducts(
        [Description("Product name or SKU to search for")] string query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return "Error: query is required";

        var q = query.Trim();
        var qLower = q.ToLower();
        var products = await _db.Products
            .Where(p => p.Name.ToLower().Contains(qLower) || p.Sku.ToLower().Contains(qLower))
            .Take(10)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Sku,
                p.Price,
                p.StockQuantity,
                Category = p.Category != null ? p.Category.Name : null
            })
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
            return $"No products found matching '{q}'.";

        return System.Text.Json.JsonSerializer.Serialize(new { products });
    }

    [McpServerTool(Name = "get_product_sales"), Description("Get total units sold and revenue for a specific product. Optionally filter by date range. Excludes cancelled orders.")]
    public async Task<string> GetProductSales(
        [Description("The product ID")] Guid productId,
        [Description("Optional start date (UTC)")] DateTime? from = null,
        [Description("Optional end date (UTC)")] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return $"Error: Product with ID {productId} not found.";

        var query = _db.OrderItems
            .Where(oi => oi.ProductId == productId)
            .Join(_db.Orders.Where(o => o.Status != Domain.Enums.OrderStatus.Cancelled),
                  oi => oi.OrderId,
                  o => o.Id,
                  (oi, o) => new { oi, o });

        if (from.HasValue)
            query = query.Where(x => x.o.CreatedAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.o.CreatedAtUtc <= to.Value);

        var items = await query
            .Select(x => new
            {
                x.oi.Quantity,
                x.oi.UnitPrice,
                x.o.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        var totalUnits = items.Sum(x => x.Quantity);
        var totalRevenue = items.Sum(x => x.Quantity * x.UnitPrice);
        var orderCount = items.Count;

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            productId,
            productName = product.Name,
            productSku = product.Sku,
            from,
            to,
            totalUnits,
            totalRevenue,
            orderCount,
            averageUnitPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0
        });
    }
}
