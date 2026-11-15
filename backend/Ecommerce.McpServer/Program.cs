using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ModelContextProtocol.Server;

var connectionString = Environment.GetEnvironmentVariable("MCP_CONNECTION_STRING")
    ?? "Data Source=ecommerce.db";

var builder = Host.CreateApplicationBuilder();

builder.Services.AddDbContext<EcommerceDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

var host = builder.Build();

// Ensure the database is created
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EcommerceDbContext>();
    await db.Database.EnsureCreatedAsync();
}

Console.Error.WriteLine("Ecommerce MCP Server starting on stdio...");
await host.RunAsync();
