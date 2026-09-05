using System;
using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class PaymentTransaction : AuditableEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";

    // Gateway identifiers
    public string? GatewayTransactionId { get; set; } // e.g. bKash trxID, SSLCommerz tran_id / val_id
    public string? GatewayPaymentId { get; set; }     // e.g. bKash paymentID, SSLCommerz sessionkey
    public string? GatewayRedirectUrl { get; set; }
    public string? GatewayResponseRaw { get; set; }
    public string? FailureReason { get; set; }
}
