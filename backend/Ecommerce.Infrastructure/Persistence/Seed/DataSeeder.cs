using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ecommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(EcommerceDbContext context, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        string[] roles = { "Admin", "Customer", "Manager" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole(roleName)
                {
                    Description = $"{roleName} role with default privileges"
                });
            }
        }

        // 2. Seed Default Admin
        var adminEmail = "admin@ecommerce.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "System",
                LastName = "Admin",
                EmailConfirmed = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // 3. Seed Default Customer
        var customerEmail = "customer@ecommerce.com";
        var customerUser = await userManager.FindByEmailAsync(customerEmail);
        if (customerUser == null)
        {
            customerUser = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                FirstName = "Demo",
                LastName = "Customer",
                EmailConfirmed = true,
                PhoneNumber = "+8801712345678",
                CreatedAtUtc = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(customerUser, "Customer@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(customerUser, "Customer");
            }
        }

        // 4. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var electronics = new Category
            {
                Name = "Electronics & Gadgets",
                NameBn = "ইলেকট্রনিক্স ও গ্যাজেট",
                Slug = "electronics",
                Description = "High-tech smart devices, headphones, audio, and accessories",
                ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
            };

            var fashion = new Category
            {
                Name = "Fashion & Apparel",
                NameBn = "পোশাক ও ফ্যাশন",
                Slug = "fashion",
                Description = "Trendy clothing, shoes, premium fabrics and watches",
                ImageUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80"
            };

            var home = new Category
            {
                Name = "Home & Living",
                NameBn = "ঘর ও সাজসজ্জা",
                Slug = "home-living",
                Description = "Cozy furniture, modern lamps, kitchenware and decor",
                ImageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80"
            };

            var organic = new Category
            {
                Name = "Groceries & Organic",
                NameBn = "মুদি ও অর্গানিক খাবার",
                Slug = "groceries",
                Description = "Pure organic honey, premium dry fruits, green tea and pantry essentials",
                ImageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
            };

            await context.Categories.AddRangeAsync(electronics, fashion, home, organic);
            await context.SaveChangesAsync();

            // 5. Seed Products
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
                    NameBn = "সোনি ওয়্যারলেস নয়েজ ক্যানসেলিং হেডফোন",
                    Description = "Industry-leading noise canceling with two processors and 8 microphones for unprecedented call and audio quality.",
                    DescriptionBn = "শিল্পের শীর্ষস্থানীয় নয়েজ ক্যানসেলিং প্রযুক্তি এবং উচ্চ মানের সাউন্ড কোয়ালিটি।",
                    Price = 38500.00m,
                    CompareAtPrice = 42000.00m,
                    StockQuantity = 25,
                    Sku = "SONY-WH1000XM5-BLK",
                    ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                    CategoryId = electronics.Id,
                    Rating = 4.9,
                    ReviewCount = 142,
                    IsFeatured = true
                },
                new Product
                {
                    Name = "Apple Watch Series 9 GPS 45mm Midnight",
                    NameBn = "অ্যাপল ওয়াচ সিরিজ ৯ স্মার্টওয়াচ",
                    Description = "Powerful sensors for health and fitness insights, brighter display, double tap gesture, and fast charging.",
                    DescriptionBn = "উন্নত হেলথ সেন্সর ও আধুনিক ফিটনেস ট্র্যাকিং সুবিধাসহ অ্যাপল ওয়াচ।",
                    Price = 46500.00m,
                    CompareAtPrice = 49990.00m,
                    StockQuantity = 15,
                    Sku = "APPL-W9-45-MID",
                    ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                    CategoryId = electronics.Id,
                    Rating = 4.8,
                    ReviewCount = 98,
                    IsFeatured = true
                },
                new Product
                {
                    Name = "Keychron K2 Pro Wireless Mechanical Keyboard",
                    NameBn = "কিক্রন মেকানিক্যাল কিবোর্ড",
                    Description = "Customizable QMK/VIA mechanical keyboard with hot-swappable red switches and RGB backlighting.",
                    DescriptionBn = "কাস্টমাইজেবল হট-সোয়াপ মেকানিক্যাল কিবোর্ড আরজিবি ব্যাকলাইটসহ।",
                    Price = 9800.00m,
                    CompareAtPrice = 11500.00m,
                    StockQuantity = 40,
                    Sku = "KEY-K2PRO-RGB",
                    ImageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
                    CategoryId = electronics.Id,
                    Rating = 4.7,
                    ReviewCount = 64,
                    IsFeatured = false
                },
                new Product
                {
                    Name = "Premium Bangladeshi Cotton Panjabi - Royal Navy",
                    NameBn = "প্রিমিয়াম সুতি পাঞ্জাবি - রয়েল নেভি",
                    Description = "Handcrafted 100% fine cotton traditional panjabi with exquisite embroidery collar.",
                    DescriptionBn = "১০০% খাঁটি সুতি কাপড়ে নিখুঁত এমব্রয়ডারি করা ঐতিহ্যবাহী পাঞ্জাবি।",
                    Price = 3200.00m,
                    CompareAtPrice = 3800.00m,
                    StockQuantity = 60,
                    Sku = "PANJ-NAVY-01",
                    ImageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
                    CategoryId = fashion.Id,
                    Rating = 4.9,
                    ReviewCount = 85,
                    IsFeatured = true
                },
                new Product
                {
                    Name = "Genuine Leather Formal Oxford Shoes",
                    NameBn = "খাঁটি চামড়ার ফরমাল জুতো",
                    Description = "Crafted from full-grain leather with cushioned insoles for all-day comfort and timeless style.",
                    DescriptionBn = "জেনুইন লেদার দিয়ে তৈরি দীর্ঘস্থায়ী ও আরামদায়ক ফরমাল জুতো।",
                    Price = 5400.00m,
                    CompareAtPrice = 6200.00m,
                    StockQuantity = 30,
                    Sku = "SHOE-OXF-BRN",
                    ImageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
                    CategoryId = fashion.Id,
                    Rating = 4.6,
                    ReviewCount = 42,
                    IsFeatured = false
                },
                new Product
                {
                    Name = "Minimalist Nordic Desk Lamp & Wireless Charger",
                    NameBn = "মিনিমালিস্ট নর্ডিক টেবিল ল্যাম্প",
                    Description = "Modern warm LED lamp featuring integrated 15W Qi fast wireless charging base.",
                    DescriptionBn = "ওয়্যারলেস চার্জিং সুবিধাসহ মডার্ন ওয়ার্ম এলইডি ডেস্ক ল্যাম্প।",
                    Price = 2800.00m,
                    CompareAtPrice = 3400.00m,
                    StockQuantity = 45,
                    Sku = "LAMP-QI-001",
                    ImageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
                    CategoryId = home.Id,
                    Rating = 4.8,
                    ReviewCount = 37,
                    IsFeatured = true
                },
                new Product
                {
                    Name = "Handmade Ceramic Pour-Over Coffee Dripper Set",
                    NameBn = "হ্যান্ডমেড সিরামিক কফি ড্রিপার সেট",
                    Description = "Artisanal ceramic dripper with wooden collar and heat-resistant glass carafe.",
                    DescriptionBn = "হাতে তৈরি প্রিমিয়াম সিরামিক কফি ব্রিউইং সেট।",
                    Price = 1950.00m,
                    CompareAtPrice = 2300.00m,
                    StockQuantity = 50,
                    Sku = "COFF-DRIP-SET",
                    ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
                    CategoryId = home.Id,
                    Rating = 4.7,
                    ReviewCount = 29,
                    IsFeatured = false
                },
                new Product
                {
                    Name = "Sundarbans Raw Wild Organic Honey (500g)",
                    NameBn = "সুন্দরবনের প্রাকৃতিক খাঁটি মধু (৫০০ গ্রাম)",
                    Description = "100% natural, unpasteurized, unprocessed organic wild honey collected directly from Sundarbans mangrove forests.",
                    DescriptionBn = "সুন্দরবনের গভীর অরণ্য থেকে সরাসরি সংগৃহীত ১০০% প্রাকৃতিক ও খাঁটি মধু।",
                    Price = 850.00m,
                    CompareAtPrice = 950.00m,
                    StockQuantity = 120,
                    Sku = "HON-SUNDAR-500",
                    ImageUrl = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
                    CategoryId = organic.Id,
                    Rating = 5.0,
                    ReviewCount = 210,
                    IsFeatured = true
                },
                new Product
                {
                    Name = "Premium Afghan Green Raisins & Roasted Cashews (400g)",
                    NameBn = "আফগান কিসমিস ও কাজু বাদাম মিক্স",
                    Description = "Nutrient-dense superfood snack mix with premium sun-dried green raisins and lightly salted roasted cashews.",
                    DescriptionBn = "উচ্চ পুষ্টিগুণসমৃদ্ধ ড্রাই ফ্রুটস ও রোস্টেড কাজু বাদাম।",
                    Price = 1100.00m,
                    CompareAtPrice = 1350.00m,
                    StockQuantity = 80,
                    Sku = "NUT-MIX-AFG",
                    ImageUrl = "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80",
                    CategoryId = organic.Id,
                    Rating = 4.9,
                    ReviewCount = 115,
                    IsFeatured = false
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
}
