using System;
using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities {
    public class CartItem {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? VariantId { get; set; }
        public int Quantity { get; set; }
        // Navigation properties (optional)
        public ApplicationUser User { get; set; }
        public Product Product { get; set; }
        public ProductVariant Variant { get; set; }
    }
}
