using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Commands.GoogleLogin;
using Ecommerce.Application.Features.Auth.Commands.Login;
using Ecommerce.Application.Features.Auth.Commands.RefreshToken;
using Ecommerce.Application.Features.Auth.Commands.Register;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

public class AuthController : BaseApiController
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginDto>>> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<LoginDto>>> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<LoginDto>>> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("google-login")]
    public async Task<ActionResult<ApiResponse<LoginDto>>> GoogleLogin([FromBody] GoogleLoginCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<ApiResponse<object>> GetCurrentUser()
    {
        return Ok(ApiResponse<object>.SuccessResult(new
        {
            UserId = CurrentUserId,
            Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            Name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            Roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(r => r.Value).ToList()
        }));
    }
}
