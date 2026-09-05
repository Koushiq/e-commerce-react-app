using System;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Payments.DTOs;

public class InitiatePaymentRequest
{
    public Guid OrderId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string CallbackUrl { get; set; } = string.Empty;
}

public class InitiatePaymentResponse
{
    public Guid OrderId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? PaymentId { get; set; }
    public string? RedirectUrl { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ExecutePaymentRequest
{
    public Guid OrderId { get; set; }
    public string PaymentId { get; set; } = string.Empty;
    public string? OtpOrValId { get; set; }
}

public class ExecutePaymentResponse
{
    public Guid OrderId { get; set; }
    public PaymentStatus Status { get; set; }
    public string? TransactionId { get; set; }
    public string Message { get; set; } = string.Empty;
}
