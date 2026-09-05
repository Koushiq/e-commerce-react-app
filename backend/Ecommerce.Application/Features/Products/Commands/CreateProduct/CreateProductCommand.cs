using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.DTOs;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string? NameBn,
    string Description,
    string? DescriptionBn,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    string Sku,
    string? ImageUrl,
    Guid CategoryId,
    bool IsFeatured = false
) : IRequest<ApiResponse<ProductDto>>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            NameBn = request.NameBn,
            Description = request.Description,
            DescriptionBn = request.DescriptionBn,
            Price = request.Price,
            CompareAtPrice = request.CompareAtPrice,
            StockQuantity = request.StockQuantity,
            Sku = request.Sku,
            ImageUrl = request.ImageUrl,
            CategoryId = request.CategoryId,
            IsFeatured = request.IsFeatured,
            Rating = 5.0,
            ReviewCount = 1
        };

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            Sku = product.Sku,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId
        };

        return ApiResponse<ProductDto>.SuccessResult(dto, "Product created successfully");
    }
}
