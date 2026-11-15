using System.ComponentModel;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;

namespace Ecommerce.McpServer.Tools;

[McpServerToolType]
public class SalesAnalyticsTools
{
    private readonly EcommerceDbContext _db;

    public SalesAnalyticsTools(EcommerceDbContext db)
    {
        _db = db;
    }

    [McpServerTool(Name = "get_average_sales"), Description("Calculate average sales (units and revenue) per day, week, or month. Optionally filter by product. Excludes cancelled orders.")]
    public async Task<string> GetAverageSales(
        [Description("Period: day, week, or month")] string period = "day",
        [Description("Optional product ID to filter by")] Guid? productId = null,
        CancellationToken cancellationToken = default)
    {
        period = (period ?? "day").ToLowerInvariant();
        if (period != "day" && period != "week" && period != "month")
            return "Error: period must be 'day', 'week', or 'month'";

        var orderQuery = _db.Orders
            .Where(o => o.Status != Domain.Enums.OrderStatus.Cancelled);

        if (productId.HasValue)
        {
            orderQuery = orderQuery.Where(o => o.Items.Any(oi => oi.ProductId == productId.Value));
        }

        var orders = await orderQuery
            .Select(o => new
            {
                o.CreatedAtUtc,
                TotalAmount = o.Items.Sum(oi => oi.Quantity * oi.UnitPrice),
                TotalItems = o.Items.Sum(oi => oi.Quantity)
            })
            .ToListAsync(cancellationToken);

        if (orders.Count == 0)
            return "No sales data found for the given criteria.";

        var minDate = orders.Min(o => o.CreatedAtUtc);
        var maxDate = orders.Max(o => o.CreatedAtUtc);

        var periodCount = period switch
        {
            "day" => Math.Max(1, (maxDate - minDate).Days),
            "week" => Math.Max(1, (int)Math.Ceiling((maxDate - minDate).TotalDays / 7)),
            "month" => Math.Max(1, (maxDate - minDate).Days / 30),
            _ => 1
        };

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalItems = orders.Sum(o => o.TotalItems);

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            period,
            productId,
            fromDate = minDate,
            toDate = maxDate,
            periodCount,
            totalRevenue,
            totalItems,
            averageRevenuePerPeriod = Math.Round(totalRevenue / periodCount, 2),
            averageItemsPerPeriod = Math.Round((double)totalItems / periodCount, 1)
        });
    }

    [McpServerTool(Name = "get_sales_summary"), Description("Get overall sales summary: total revenue, order count, pending orders, average order value. Optionally filter by date range.")]
    public async Task<string> GetSalesSummary(
        [Description("Optional start date (UTC)")] DateTime? from = null,
        [Description("Optional end date (UTC)")] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var orderQuery = _db.Orders.AsQueryable();

        if (from.HasValue)
            orderQuery = orderQuery.Where(o => o.CreatedAtUtc >= from.Value);

        if (to.HasValue)
            orderQuery = orderQuery.Where(o => o.CreatedAtUtc <= to.Value);

        var orders = await orderQuery
            .Select(o => new
            {
                o.Status,
                o.TotalAmount
            })
            .ToListAsync(cancellationToken);

        var activeOrders = orders.Where(o => o.Status != Domain.Enums.OrderStatus.Cancelled).ToList();
        var totalRevenue = activeOrders.Sum(o => o.TotalAmount);
        var orderCount = activeOrders.Count;

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            from,
            to,
            totalOrders = orders.Count,
            activeOrders = orderCount,
            cancelledOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Cancelled),
            pendingOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Pending),
            confirmedOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Confirmed),
            shippedOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Shipped),
            deliveredOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Delivered),
            totalRevenue = Math.Round(totalRevenue, 2),
            averageOrderValue = orderCount > 0 ? Math.Round(totalRevenue / orderCount, 2) : 0
        });
    }

    [McpServerTool(Name = "get_top_products"), Description("Get top-selling products ranked by units sold or revenue. Excludes cancelled orders.")]
    public async Task<string> GetTopProducts(
        [Description("Number of products to return (default 10)")] int limit = 10,
        [Description("Sort by: revenue or units")] string sortBy = "revenue",
        CancellationToken cancellationToken = default)
    {
        sortBy = (sortBy ?? "revenue").ToLowerInvariant();
        if (sortBy != "revenue" && sortBy != "units")
            return "Error: sortBy must be 'revenue' or 'units'";

        var query = _db.OrderItems
            .Join(_db.Orders.Where(o => o.Status != Domain.Enums.OrderStatus.Cancelled),
                  oi => oi.OrderId,
                  o => o.Id,
                  (oi, o) => new { oi, o })
            .GroupBy(x => new { x.oi.ProductId, x.oi.ProductName, x.oi.UnitPrice })
            .Select(g => new
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                UnitsSold = g.Sum(x => x.oi.Quantity),
                Revenue = g.Sum(x => x.oi.Quantity * x.oi.UnitPrice),
                OrderCount = g.Count()
            });

        query = sortBy == "units"
            ? query.OrderByDescending(x => x.UnitsSold)
            : query.OrderByDescending(x => x.Revenue);

        var products = await query
            .Take(limit)
            .ToListAsync(cancellationToken);

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            sortBy,
            products
        });
    }
}
