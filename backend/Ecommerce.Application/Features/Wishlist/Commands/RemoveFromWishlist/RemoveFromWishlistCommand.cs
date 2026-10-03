using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlist.Commands.RemoveFromWishlist;

public record RemoveFromWishlistCommand(
    Guid? UserId,
    Guid ProductId
) : IRequest<ApiResponse<bool>>;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public RemoveFromWishlistCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? Guid.Empty;
        var existing = await _unitOfWork.WishlistItems.FindAsync(
            w => w.ProductId == request.ProductId && (userId == Guid.Empty || w.UserId == userId),
            cancellationToken
        );

        foreach (var item in existing)
        {
            _unitOfWork.WishlistItems.Remove(item);
        }

        if (existing.Any())
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<bool>.SuccessResult(true, "Item removed from wishlist successfully.");
    }
}
