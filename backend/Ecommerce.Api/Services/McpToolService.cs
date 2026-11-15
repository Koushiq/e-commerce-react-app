using Ecommerce.Infrastructure.Persistence;
using Ecommerce.McpServer.Tools;
using Microsoft.Extensions.AI;

namespace Ecommerce.Api.Services;

public class McpToolService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<McpToolService> _logger;

    public McpToolService(IServiceProvider serviceProvider, ILogger<McpToolService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<string> ExecuteToolAsync(string toolName, Dictionary<string, object> arguments)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EcommerceDbContext>();

        try
        {
            return toolName switch
            {
                "search_products" => await new ProductSalesTools(db).SearchProducts(
                    GetString(arguments, "query") ?? string.Empty),

                "get_product_sales" => await new ProductSalesTools(db).GetProductSales(
                    GetGuid(arguments, "productId"),
                    GetDateTime(arguments, "from"),
                    GetDateTime(arguments, "to")),

                "get_product_stock" => await new InventoryTools(db).GetProductStock(
                    GetGuid(arguments, "productId")),

                "get_low_stock_products" => await new InventoryTools(db).GetLowStockProducts(
                    GetInt(arguments, "threshold", 10)),

                "get_average_sales" => await new SalesAnalyticsTools(db).GetAverageSales(
                    GetString(arguments, "period") ?? "day",
                    GetNullableGuid(arguments, "productId")),

                "get_sales_summary" => await new SalesAnalyticsTools(db).GetSalesSummary(
                    GetDateTime(arguments, "from"),
                    GetDateTime(arguments, "to")),

                "get_top_products" => await new SalesAnalyticsTools(db).GetTopProducts(
                    GetInt(arguments, "limit", 10),
                    GetString(arguments, "sortBy") ?? "revenue"),

                "get_recent_orders" => await new OrderTools(db).GetRecentOrders(
                    GetInt(arguments, "limit", 10)),

                "get_order_status_lookup" => await new OrderTools(db).GetOrderStatusLookup(),

                _ => $"Error: Unknown tool '{toolName}'"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing tool {ToolName}", toolName);
            return $"Error executing {toolName}: {ex.Message}";
        }
    }

    public IReadOnlyList<string> GetAvailableTools()
    {
        return new List<string>
        {
            "search_products",
            "get_product_sales",
            "get_product_stock",
            "get_low_stock_products",
            "get_average_sales",
            "get_sales_summary",
            "get_top_products",
            "get_recent_orders",
            "get_order_status_lookup"
        };
    }

    private static string? GetString(Dictionary<string, object> dict, string key, string? defaultValue = null)
    {
        return dict.TryGetValue(key, out var value) ? value?.ToString() ?? defaultValue : defaultValue;
    }

    private static Guid? GetNullableGuid(Dictionary<string, object> dict, string key)
    {
        if (!dict.TryGetValue(key, out var value) || value == null) return null;
        try { return value is Guid g ? g : Guid.Parse(value.ToString()!); }
        catch { return null; }
    }

    private static Guid GetGuid(Dictionary<string, object> dict, string key)
    {
        return GetNullableGuid(dict, key) ?? Guid.Empty;
    }

    private static int GetInt(Dictionary<string, object> dict, string key, int defaultValue = 0)
    {
        if (!dict.TryGetValue(key, out var value) || value == null) return defaultValue;
        try { return value is int i ? i : int.Parse(value.ToString()!); }
        catch { return defaultValue; }
    }

    private static DateTime? GetDateTime(Dictionary<string, object> dict, string key)
    {
        if (!dict.TryGetValue(key, out var value) || value == null) return null;
        try { return value is DateTime dt ? dt : DateTime.Parse(value.ToString()!); }
        catch { return null; }
    }
}
