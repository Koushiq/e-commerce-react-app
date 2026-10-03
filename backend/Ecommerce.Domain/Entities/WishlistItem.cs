using System;
using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }

    // Navigation properties (optional)
    public ApplicationUser? User { get; set; }
    public Product? Product { get; set; }
    public ProductVariant? Variant { get; set; }
}
