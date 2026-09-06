using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities;

public class ProductVariant
{
    [Key]
    public Guid Id { get; set; }

    // Foreign key to Product
    public Guid ProductId { get; set; }
    [ForeignKey("ProductId")]
    public Product Product { get; set; } = null!;

    // Variant attributes – optional, can be null if not applicable
    public string? Color { get; set; }
    public string? Type { get; set; }
    public string? Size { get; set; }

    // Additional price added to the base Product.Price
    [Column(TypeName = "decimal(18,2)")]
    public decimal AdditionalPrice { get; set; }
}
