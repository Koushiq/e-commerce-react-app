using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.DTOs;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(
    Guid? UserId,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    string City,
    string PostalCode,
    PaymentMethod PaymentMethod,
    List<CreateOrderItemRequest> Items
) : IRequest<ApiResponse<OrderDto>>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, ApiResponse<OrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new AppException("Order must contain at least one item");
        }

        var order = new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(100, 999)}",
            UserId = request.UserId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            City = request.City,
            PostalCode = request.PostalCode,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = request.PaymentMethod == PaymentMethod.CashOnDelivery ? PaymentStatus.Pending : PaymentStatus.Pending,
            Status = OrderStatus.Pending,
            ShippingFee = 60.0m // Standard delivery inside Dhaka / simulated
        };

        decimal subtotal = 0;
        foreach (var itemReq in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(itemReq.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException($"Product {itemReq.ProductId} not found");
            }

            if (product.StockQuantity < itemReq.Quantity)
            {
                throw new AppException($"Insufficient stock for product '{product.Name}'");
            }

            // Deduct stock
            product.StockQuantity -= itemReq.Quantity;
            _unitOfWork.Products.Update(product);

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = itemReq.Quantity
            };
            order.Items.Add(orderItem);
            subtotal += orderItem.TotalPrice;
        }

        order.SubTotal = subtotal;
        order.TotalAmount = subtotal + order.ShippingFee;

        await _unitOfWork.Orders.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            SubTotal = order.SubTotal,
            ShippingFee = order.ShippingFee,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            ShippingAddress = order.ShippingAddress,
            City = order.City,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        };

        return ApiResponse<OrderDto>.SuccessResult(dto, "Order created successfully");
    }
}
