using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Caching;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.DTOs;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProducts;

public record GetProductsQuery(
    string? CategorySlug = null,
    string? SearchTerm = null,
    bool? FeaturedOnly = null
) : IRequest<ApiResponse<List<ProductDto>>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, ApiResponse<List<ProductDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;

    public GetProductsQueryHandler(IUnitOfWork unitOfWork, ICacheService cacheService)
    {
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
    }

    public async Task<ApiResponse<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        string cacheKey = $"products_{request.CategorySlug}_{request.SearchTerm}_{request.FeaturedOnly}";
        var cached = await _cacheService.GetAsync<List<ProductDto>>(cacheKey, cancellationToken);
        if (cached != null)
        {
            return ApiResponse<List<ProductDto>>.SuccessResult(cached, "Products retrieved from cache");
        }

        var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
        var categories = (await _unitOfWork.Categories.GetAllAsync(cancellationToken))
            .ToDictionary(c => c.Id, c => c.Name);

        var query = products.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.CategorySlug))
        {
            var allCats = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
            var cat = allCats.FirstOrDefault(c => c.Slug.Equals(request.CategorySlug, System.StringComparison.OrdinalIgnoreCase));
            if (cat != null)
            {
                query = query.Where(p => p.CategoryId == cat.Id);
            }
        }

        if (request.FeaturedOnly == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p => (p.Name != null && p.Name.ToLower().Contains(term)) || 
                                     (p.Description != null && p.Description.ToLower().Contains(term)));
        }

        var list = query.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            NameBn = p.NameBn,
            Description = p.Description,
            DescriptionBn = p.DescriptionBn,
            Price = p.Price,
            CompareAtPrice = p.CompareAtPrice,
            StockQuantity = p.StockQuantity,
            Sku = p.Sku,
            ImageUrl = p.ImageUrl,
            Rating = p.Rating,
            ReviewCount = p.ReviewCount,
            IsFeatured = p.IsFeatured,
            CategoryId = p.CategoryId,
            CategoryName = categories.ContainsKey(p.CategoryId) ? categories[p.CategoryId] : string.Empty
        }).ToList();

        await _cacheService.SetAsync(cacheKey, list, System.TimeSpan.FromMinutes(5), cancellationToken: cancellationToken);

        return ApiResponse<List<ProductDto>>.SuccessResult(list, "Products retrieved successfully");
    }
}
