using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IReadOnlyList<Product>> GetFeaturedProductsAsync(int count, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetByCategorySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Product?> GetWithCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
