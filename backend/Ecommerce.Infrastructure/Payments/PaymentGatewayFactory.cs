using System;
using System.Collections.Generic;
using System.Linq;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Infrastructure.Payments;

public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    private readonly IEnumerable<IPaymentGatewayService> _services;

    public PaymentGatewayFactory(IEnumerable<IPaymentGatewayService> services)
    {
        _services = services;
    }

    public IPaymentGatewayService GetService(PaymentMethod method)
    {
        var service = _services.FirstOrDefault(s => s.Method == method);
        if (service == null)
        {
            throw new AppException($"Payment method '{method}' is not supported or configured.");
        }

        return service;
    }
}
