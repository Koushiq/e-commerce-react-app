using System;
using System.Collections.Generic;
using System.Linq;
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

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<ApiResponse<LoginDto>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<LoginDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public RefreshTokenCommandHandler(
        UserManager<ApplicationUser> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<LoginDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokens = await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == request.RefreshToken, cancellationToken);
        var existingToken = tokens.FirstOrDefault();

        if (existingToken == null || !existingToken.IsActive)
        {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        var user = await _userManager.FindByIdAsync(existingToken.UserId.ToString());
        if (user == null)
        {
            throw new UnauthorizedException("User not found");
        }

        // Rotate token
        existingToken.IsRevoked = true;
        existingToken.RevokedAtUtc = DateTime.UtcNow;

        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken(user.Id);
        existingToken.ReplacedByToken = newRefreshToken.Token;
        _unitOfWork.RefreshTokens.Update(existingToken);

        await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var roles = await _userManager.GetRolesAsync(user);
        var (newAccessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user, roles);

        var dto = new LoginDto
        {
            AccessToken = newAccessToken,
            ExpiresAtUtc = expiresAt,
            RefreshToken = newRefreshToken.Token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = new List<string>(roles)
        };

        return ApiResponse<LoginDto>.SuccessResult(dto, "Token refreshed successfully");
    }
}
