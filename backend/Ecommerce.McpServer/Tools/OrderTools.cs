using System.ComponentModel;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;

namespace Ecommerce.McpServer.Tools;

[McpServerToolType]
public class OrderTools
{
    private readonly EcommerceDbContext _db;

    public OrderTools(EcommerceDbContext db)
    {
        _db = db;
    }

    [McpServerTool(Name = "get_recent_orders"), Description("Get the most recent orders with their status, customer info, and totals.")]
    public async Task<string> GetRecentOrders(
        [Description("Number of orders to return (default 10)")] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var orders = await _db.Orders
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(limit)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.CustomerEmail,
                o.Status,
                o.PaymentStatus,
                o.TotalAmount,
                o.CreatedAtUtc,
                ItemCount = o.Items.Count
            })
            .ToListAsync(cancellationToken);

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            orders
        });
    }

    [McpServerTool(Name = "get_order_status_lookup"), Description("Get count of orders grouped by status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled).")]
    public async Task<string> GetOrderStatusLookup(
        CancellationToken cancellationToken = default)
    {
        var statuses = await _db.Orders
            .GroupBy(o => o.Status)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count(),
                TotalValue = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync(cancellationToken);

        var allStatuses = Enum.GetValues(typeof(Domain.Enums.OrderStatus))
            .Cast<Domain.Enums.OrderStatus>()
            .Select(s => s.ToString())
            .ToList();

        var result = allStatuses.ToDictionary(
            s => s,
            s => statuses.FirstOrDefault(x => x.Status == s)?.Count ?? 0
        );

        return System.Text.Json.JsonSerializer.Serialize(new
        {
            countsByStatus = result,
            details = statuses
        });
    }
}
