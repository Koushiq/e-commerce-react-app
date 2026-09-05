using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Payments;

public class BkashPaymentService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<BkashPaymentService> _logger;

    public PaymentMethod Method => PaymentMethod.Bkash;

    public BkashPaymentService(IConfiguration configuration, ILogger<BkashPaymentService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string callbackUrl, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Initiating bKash payment for Order {OrderId} of amount {Amount}", order.Id, order.TotalAmount);

        // Generate bKash payment ID and simulated redirect or tokenized URL
        var paymentId = $"BK-{Guid.NewGuid():N}";
        var simulatedRedirect = $"{callbackUrl}?paymentId={paymentId}&orderId={order.Id}&gateway=bkash&amount={order.TotalAmount}";

        return Task.FromResult(new PaymentInitiationResult
        {
            Success = true,
            PaymentId = paymentId,
            RedirectUrl = simulatedRedirect,
            Message = "bKash checkout URL generated"
        });
    }

    public Task<PaymentExecutionResult> ExecutePaymentAsync(string paymentId, string? otpOrValId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Executing bKash payment with ID {PaymentId}", paymentId);

        // Simulated bKash verification logic
        var trxId = $"TRX-{new Random().Next(10000000, 99999999)}";

        return Task.FromResult(new PaymentExecutionResult
        {
            Success = true,
            Status = PaymentStatus.Success,
            TransactionId = trxId,
            Message = "bKash payment executed successfully",
            RawResponse = $"{{\"statusCode\":\"0000\",\"statusMessage\":\"Successful\",\"paymentID\":\"{paymentId}\",\"trxID\":\"{trxId}\"}}"
        });
    }
}
