using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.DTOs;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Payments.Commands.InitiatePayment;

public record InitiatePaymentCommand(InitiatePaymentRequest Request) : IRequest<ApiResponse<InitiatePaymentResponse>>;

public class InitiatePaymentCommandHandler : IRequestHandler<InitiatePaymentCommand, ApiResponse<InitiatePaymentResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentGatewayFactory _gatewayFactory;

    public InitiatePaymentCommandHandler(IUnitOfWork unitOfWork, IPaymentGatewayFactory gatewayFactory)
    {
        _unitOfWork = unitOfWork;
        _gatewayFactory = gatewayFactory;
    }

    public async Task<ApiResponse<InitiatePaymentResponse>> Handle(InitiatePaymentCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        var order = await _unitOfWork.Orders.GetByIdAsync(req.OrderId, cancellationToken);
        if (order == null)
        {
            throw new NotFoundException($"Order {req.OrderId} not found");
        }

        if (order.PaymentStatus == PaymentStatus.Success)
        {
            throw new AppException("Order has already been paid for");
        }

        order.PaymentMethod = req.PaymentMethod;

        var gateway = _gatewayFactory.GetService(req.PaymentMethod);
        var result = await gateway.InitiatePaymentAsync(order, req.CallbackUrl, cancellationToken);

        if (!result.Success)
        {
            throw new AppException(result.ErrorMessage ?? "Payment initiation failed");
        }

        var transaction = new PaymentTransaction
        {
            OrderId = order.Id,
            Method = req.PaymentMethod,
            Amount = order.TotalAmount,
            Status = PaymentStatus.Processing,
            GatewayPaymentId = result.PaymentId,
            GatewayRedirectUrl = result.RedirectUrl
        };

        await _unitOfWork.PaymentTransactions.AddAsync(transaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new InitiatePaymentResponse
        {
            OrderId = order.Id,
            PaymentMethod = req.PaymentMethod,
            PaymentId = result.PaymentId,
            RedirectUrl = result.RedirectUrl,
            Message = result.Message ?? "Payment initiated"
        };

        return ApiResponse<InitiatePaymentResponse>.SuccessResult(response, "Payment initiated successfully");
    }
}
