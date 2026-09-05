using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Payments;

public class SslCommerzPaymentService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SslCommerzPaymentService> _logger;

    public PaymentMethod Method => PaymentMethod.SslCommerz;

    public SslCommerzPaymentService(IConfiguration configuration, ILogger<SslCommerzPaymentService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string callbackUrl, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Initiating SSLCommerz session for Order {OrderId} of amount {Amount}", order.Id, order.TotalAmount);

        var sessionKey = $"SSL-{Guid.NewGuid():N}";
        var simulatedGatewayUrl = $"{callbackUrl}?sessionkey={sessionKey}&orderId={order.Id}&gateway=sslcommerz&amount={order.TotalAmount}";

        return Task.FromResult(new PaymentInitiationResult
        {
            Success = true,
            PaymentId = sessionKey,
            RedirectUrl = simulatedGatewayUrl,
            Message = "SSLCommerz session created"
        });
    }

    public Task<PaymentExecutionResult> ExecutePaymentAsync(string paymentId, string? otpOrValId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Validating SSLCommerz payment for session {SessionKey}", paymentId);

        var bankTranId = $"SSL-TXN-{new Random().Next(10000000, 99999999)}";

        return Task.FromResult(new PaymentExecutionResult
        {
            Success = true,
            Status = PaymentStatus.Success,
            TransactionId = bankTranId,
            Message = "SSLCommerz payment validated successfully",
            RawResponse = $"{{\"status\":\"VALID\",\"sessionkey\":\"{paymentId}\",\"bank_tran_id\":\"{bankTranId}\",\"currency\":\"BDT\"}}"
        });
    }
}
