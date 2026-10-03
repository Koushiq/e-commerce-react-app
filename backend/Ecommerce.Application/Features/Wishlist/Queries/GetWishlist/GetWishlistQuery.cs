using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Wishlist.DTOs;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlist.Queries.GetWishlist;

public record GetWishlistQuery(Guid? UserId) : IRequest<ApiResponse<List<WishlistItemDto>>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, ApiResponse<List<WishlistItemDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWishlistQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? Guid.Empty;
        var items = await _unitOfWork.WishlistItems.FindAsync(
            w => userId == Guid.Empty || w.UserId == userId,
            cancellationToken
        );

        var dtos = new List<WishlistItemDto>();
        foreach (var item in items)
        {
            var product = await _unitOfWork.Products.GetWithCategoryByIdAsync(item.ProductId, cancellationToken);
            dtos.Add(new WishlistItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                ProductName = product?.Name ?? "Product",
                Price = product?.Price ?? 0,
                ImageUrl = product?.ImageUrl,
                CategoryName = product?.Category?.Name ?? string.Empty
            });
        }

        return ApiResponse<List<WishlistItemDto>>.SuccessResult(dtos, "Wishlist retrieved successfully.");
    }
}
