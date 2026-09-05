using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    IOrderRepository Orders { get; }
    IRepository<Category> Categories { get; }
    IRepository<PaymentTransaction> PaymentTransactions { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<AppLog> Logs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
