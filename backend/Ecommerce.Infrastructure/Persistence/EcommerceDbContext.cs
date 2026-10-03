using System;
using Ecommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence;

public class EcommerceDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public EcommerceDbContext(DbContextOptions<EcommerceDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AppLog> AppLogs => Set<AppLog>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Price).HasPrecision(18, 2);
            entity.Property(p => p.CompareAtPrice).HasPrecision(18, 2);
            entity.HasOne(p => p.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.AdditionalPrice).HasPrecision(18, 2);
            entity.HasOne(v => v.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        builder.Entity<Category>(entity =>
{
    entity.HasKey(c => c.Id);
    entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
    entity.Property(c => c.Slug).IsRequired().HasMaxLength(120);
    entity.HasIndex(c => c.Slug).IsUnique();
});

        builder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(o => o.SubTotal).HasPrecision(18, 2);
            entity.Property(o => o.ShippingFee).HasPrecision(18, 2);
            entity.Property(o => o.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(oi => oi.Product)
                  .WithMany()
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(pt => pt.Id);
            entity.Property(pt => pt.Amount).HasPrecision(18, 2);
            entity.HasOne(pt => pt.Order)
                  .WithMany(o => o.Transactions)
                  .HasForeignKey(pt => pt.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.Token).IsRequired().HasMaxLength(256);
            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AppLog>(entity =>
        {
            entity.HasKey(l => l.Id);
        });
    }
}
