using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.DTOs;
using Ecommerce.Application.Features.Orders.Queries.GetOrderById;
using Ecommerce.Application.Features.Orders.Queries.GetUserOrders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

public class OrdersController : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CreateOrderCommand command)
    {
        // If user is authenticated, attach their UserId automatically
        if (CurrentUserId.HasValue && !command.UserId.HasValue)
        {
            command = command with { UserId = CurrentUserId.Value };
        }

        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderById(Guid id)
    {
        var query = new GetOrderByIdQuery(id);
        var result = await Mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<OrderDto>>>> GetMyOrders()
    {
        if (!CurrentUserId.HasValue)
        {
            return Unauthorized();
        }

        var query = new GetUserOrdersQuery(CurrentUserId.Value);
        var result = await Mediator.Send(query);
        return Ok(result);
    }
}
