using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Wishlist.Commands.AddToWishlist;
using Ecommerce.Application.Features.Wishlist.Commands.RemoveFromWishlist;
using Ecommerce.Application.Features.Wishlist.DTOs;
using Ecommerce.Application.Features.Wishlist.Queries.GetWishlist;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

public class WishlistController : BaseApiController
{
    [HttpPost("add")]
    public async Task<ActionResult<ApiResponse<Guid>>> AddToWishlist([FromBody] AddToWishlistCommand command)
    {
        if (CurrentUserId.HasValue && !command.UserId.HasValue)
        {
            command = command with { UserId = CurrentUserId.Value };
        }

        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{productId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveFromWishlist(Guid productId)
    {
        var command = new RemoveFromWishlistCommand(CurrentUserId, productId);
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WishlistItemDto>>>> GetWishlist()
    {
        var query = new GetWishlistQuery(CurrentUserId);
        var result = await Mediator.Send(query);
        return Ok(result);
    }
}
