using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlist.Commands.AddToWishlist;

public record AddToWishlistCommand(
    Guid ProductId,
    Guid? VariantId = null,
    Guid? UserId = null
) : IRequest<ApiResponse<Guid>>;

public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, ApiResponse<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;

    public AddToWishlistCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
    {
        if (request.ProductId == Guid.Empty)
        {
            throw new AppException("Invalid Product ID.");
        }

        var userId = request.UserId ?? Guid.Empty;
        var existing = await _unitOfWork.WishlistItems.FindAsync(
            w => w.ProductId == request.ProductId && (userId == Guid.Empty || w.UserId == userId),
            cancellationToken
        );

        if (existing.Any())
        {
            return ApiResponse<Guid>.SuccessResult(request.ProductId, "Item is already in wishlist.");
        }

        var item = new WishlistItem
        {
            UserId = userId,
            ProductId = request.ProductId,
            VariantId = request.VariantId
        };

        await _unitOfWork.WishlistItems.AddAsync(item, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResult(request.ProductId, "Item added to wishlist successfully.");
    }
}
