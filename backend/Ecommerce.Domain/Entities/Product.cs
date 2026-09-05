using System;
using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? NameBn { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? DescriptionBn { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double Rating { get; set; } = 4.5;
    public int ReviewCount { get; set; } = 0;
    public bool IsFeatured { get; set; }

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
