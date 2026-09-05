using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence;

namespace Ecommerce.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly EcommerceDbContext _context;

    public IProductRepository Products { get; }
    public IOrderRepository Orders { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<PaymentTransaction> PaymentTransactions { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<AppLog> Logs { get; }

    public UnitOfWork(EcommerceDbContext context)
    {
        _context = context;
        Products = new ProductRepository(context);
        Orders = new OrderRepository(context);
        Categories = new GenericRepository<Category>(context);
        PaymentTransactions = new GenericRepository<PaymentTransaction>(context);
        RefreshTokens = new GenericRepository<RefreshToken>(context);
        Logs = new GenericRepository<AppLog>(context);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
