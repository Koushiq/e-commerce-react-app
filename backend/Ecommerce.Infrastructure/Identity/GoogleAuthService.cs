using System;
using System.Threading.Tasks;
using Ecommerce.Application.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Identity;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(ILogger<GoogleAuthService> logger)
    {
        _logger = logger;
    }

    public async Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken)
    {
        try
        {
            // Allow demo tokens for testing purposes
            if (idToken.StartsWith("demo-google-token-"))
            {
                var email = idToken.Replace("demo-google-token-", "") + "@gmail.com";
                return new GoogleUserInfo
                {
                    Email = email,
                    FirstName = "Demo",
                    LastName = "GoogleUser",
                    PictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    Subject = Guid.NewGuid().ToString()
                };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings());
            return new GoogleUserInfo
            {
                Email = payload.Email,
                FirstName = payload.GivenName ?? string.Empty,
                LastName = payload.FamilyName ?? string.Empty,
                PictureUrl = payload.Picture,
                Subject = payload.Subject
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate Google ID Token");
            return null;
        }
    }
}
