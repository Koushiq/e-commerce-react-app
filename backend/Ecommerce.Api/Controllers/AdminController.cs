using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<object>>> GetDashboardStats(CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var orders = await _unitOfWork.Orders.GetAllAsync(cancellationToken);
        var wishlistItems = await _unitOfWork.WishlistItems.GetAllAsync(cancellationToken);
        var totalUsers = await _userManager.Users.CountAsync(cancellationToken);

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var pendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);

        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(6)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.CustomerEmail,
                o.TotalAmount,
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod.ToString(),
                o.CreatedAtUtc
            })
            .ToList();

        var stats = new
        {
            totalProducts = products.Count,
            totalCategories = categories.Count,
            totalOrders = orders.Count,
            totalUsers,
            totalWishlistItems = wishlistItems.Count,
            totalRevenue,
            pendingOrders,
            recentOrders
        };

        return Ok(ApiResponse<object>.SuccessResult(stats, "Admin dashboard stats retrieved"));
    }
}
