using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.DTOs;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Payments.Commands.ExecutePayment;

public record ExecutePaymentCommand(ExecutePaymentRequest Request) : IRequest<ApiResponse<ExecutePaymentResponse>>;

public class ExecutePaymentCommandHandler : IRequestHandler<ExecutePaymentCommand, ApiResponse<ExecutePaymentResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentGatewayFactory _gatewayFactory;

    public ExecutePaymentCommandHandler(IUnitOfWork unitOfWork, IPaymentGatewayFactory gatewayFactory)
    {
        _unitOfWork = unitOfWork;
        _gatewayFactory = gatewayFactory;
    }

    public async Task<ApiResponse<ExecutePaymentResponse>> Handle(ExecutePaymentCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        var order = await _unitOfWork.Orders.GetByIdAsync(req.OrderId, cancellationToken);
        if (order == null)
        {
            throw new NotFoundException($"Order {req.OrderId} not found");
        }

        var transactions = await _unitOfWork.PaymentTransactions.FindAsync(t => t.OrderId == order.Id && t.GatewayPaymentId == req.PaymentId, cancellationToken);
        var transaction = transactions.FirstOrDefault();
        if (transaction == null)
        {
            throw new NotFoundException("Payment transaction not found for this order and payment ID");
        }

        var gateway = _gatewayFactory.GetService(order.PaymentMethod);
        var execResult = await gateway.ExecutePaymentAsync(req.PaymentId, req.OtpOrValId, cancellationToken);

        transaction.Status = execResult.Status;
        transaction.GatewayTransactionId = execResult.TransactionId;
        transaction.GatewayResponseRaw = execResult.RawResponse;
        _unitOfWork.PaymentTransactions.Update(transaction);

        if (execResult.Success)
        {
            order.PaymentStatus = PaymentStatus.Success;
            order.Status = OrderStatus.Confirmed;
            _unitOfWork.Orders.Update(order);
        }
        else
        {
            order.PaymentStatus = PaymentStatus.Failed;
            _unitOfWork.Orders.Update(order);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new ExecutePaymentResponse
        {
            OrderId = order.Id,
            Status = execResult.Status,
            TransactionId = execResult.TransactionId,
            Message = execResult.Message ?? (execResult.Success ? "Payment completed successfully" : "Payment failed")
        };

        return ApiResponse<ExecutePaymentResponse>.SuccessResult(response, response.Message);
    }
}
