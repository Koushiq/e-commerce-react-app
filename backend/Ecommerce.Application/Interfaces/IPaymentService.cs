using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Interfaces;

public class PaymentInitiationResult
{
    public bool Success { get; set; }
    public string? PaymentId { get; set; }
    public string? RedirectUrl { get; set; }
    public string? Message { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PaymentExecutionResult
{
    public bool Success { get; set; }
    public string? TransactionId { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Message { get; set; }
    public string? RawResponse { get; set; }
}

public interface IPaymentGatewayService
{
    PaymentMethod Method { get; }
    Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string callbackUrl, CancellationToken cancellationToken = default);
    Task<PaymentExecutionResult> ExecutePaymentAsync(string paymentId, string? otpOrValId, CancellationToken cancellationToken = default);
}

public interface IPaymentGatewayFactory
{
    IPaymentGatewayService GetService(PaymentMethod method);
}
