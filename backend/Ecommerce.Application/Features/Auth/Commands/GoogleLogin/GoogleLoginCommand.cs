using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Commands.Login;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Application.Features.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand(string IdToken) : IRequest<ApiResponse<LoginDto>>;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, ApiResponse<LoginDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public GoogleLoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        IGoogleAuthService googleAuthService,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _googleAuthService = googleAuthService;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<LoginDto>> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var googleUser = await _googleAuthService.ValidateIdTokenAsync(request.IdToken);
        if (googleUser == null)
        {
            throw new UnauthorizedException("Invalid Google token");
        }

        var user = await _userManager.FindByEmailAsync(googleUser.Email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = googleUser.Email,
                Email = googleUser.Email,
                FirstName = string.IsNullOrEmpty(googleUser.FirstName) ? "Google" : googleUser.FirstName,
                LastName = string.IsNullOrEmpty(googleUser.LastName) ? "User" : googleUser.LastName,
                ProfilePictureUrl = googleUser.PictureUrl,
                EmailConfirmed = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                throw new AppException("Failed to register Google user");
            }

            await _userManager.AddToRoleAsync(user, "Customer");
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Count == 0)
        {
            roles = new List<string> { "Customer" };
        }

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user, roles);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(user.Id);

        await _unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        user.LastLoginAtUtc = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LoginDto
        {
            AccessToken = accessToken,
            ExpiresAtUtc = expiresAt,
            RefreshToken = refreshToken.Token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = new List<string>(roles)
        };

        return ApiResponse<LoginDto>.SuccessResult(dto, "Google authentication successful");
    }
}
