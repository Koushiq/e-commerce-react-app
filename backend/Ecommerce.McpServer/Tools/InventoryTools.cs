using System.ComponentModel;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;

namespace Ecommerce.McpServer.Tools;

[McpServerToolType]
public class InventoryTools
{
    private readonly EcommerceDbContext _db;

    public InventoryTools(EcommerceDbContext db)
    {
        _db = db;
    }

    [McpServerTool(Name = "get_product_stock"), Description("Get current stock quantity for a product. Returns base stock plus variant-level breakdown.")]
    public async Task<string> GetProductStock(
        [Description("The product ID")] Guid productId,
        CancellationToken cancellationToken = default)
    {
        var product = await _db.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return $"Error: Product with ID {productId} not found.";

        var variants = product.Variants
            .Select(v => new
            {
                v.Id,
                v.Color,
                v.Size,
                v.Type,
                v.AdditionalPrice
            })
            .ToList();

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            productId,
            productName = product.Name,
            productSku = product.Sku,
            baseStock = product.StockQuantity,
            variants,
            isInStock = product.StockQuantity > 0,
            status = product.StockQuantity == 0 ? "Out of Stock" :
                     product.StockQuantity < 10 ? "Low Stock" : "In Stock"
        });
    }

    [McpServerTool(Name = "get_low_stock_products"), Description("List products with stock quantity below the specified threshold.")]
    public async Task<string> GetLowStockProducts(
        [Description("Stock threshold (default 10)")] int threshold = 10,
        CancellationToken cancellationToken = default)
    {
        var products = await _db.Products
            .Where(p => p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .Take(50)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Sku,
                p.StockQuantity,
                p.Price
            })
            .ToListAsync(cancellationToken);

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            threshold,
            count = products.Count,
            products
        });
    }
}
