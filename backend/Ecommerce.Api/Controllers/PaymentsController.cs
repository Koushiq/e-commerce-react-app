using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.Commands.ExecutePayment;
using Ecommerce.Application.Features.Payments.Commands.InitiatePayment;
using Ecommerce.Application.Features.Payments.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

public class PaymentsController : BaseApiController
{
    [HttpPost("initiate")]
    public async Task<ActionResult<ApiResponse<InitiatePaymentResponse>>> InitiatePayment([FromBody] InitiatePaymentRequest request)
    {
        var command = new InitiatePaymentCommand(request);
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("execute")]
    public async Task<ActionResult<ApiResponse<ExecutePaymentResponse>>> ExecutePayment([FromBody] ExecutePaymentRequest request)
    {
        var command = new ExecutePaymentCommand(request);
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
