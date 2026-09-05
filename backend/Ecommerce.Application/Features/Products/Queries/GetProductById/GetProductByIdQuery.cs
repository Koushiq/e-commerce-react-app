using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.DTOs;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductById;

public record GetProductByIdQuery(Guid Id) : IRequest<ApiResponse<ProductDto>>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetProductByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetWithCategoryByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException($"Product with Id '{request.Id}' was not found.");
        }

        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            NameBn = product.NameBn,
            Description = product.Description,
            DescriptionBn = product.DescriptionBn,
            Price = product.Price,
            CompareAtPrice = product.CompareAtPrice,
            StockQuantity = product.StockQuantity,
            Sku = product.Sku,
            ImageUrl = product.ImageUrl,
            Rating = product.Rating,
            ReviewCount = product.ReviewCount,
            IsFeatured = product.IsFeatured,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty
        };

        return ApiResponse<ProductDto>.SuccessResult(dto, "Product retrieved successfully");
    }
}
