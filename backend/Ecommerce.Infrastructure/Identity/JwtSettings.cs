namespace Ecommerce.Infrastructure.Identity;

public class JwtSettings
{
    public string SecretKey { get; set; } = "SuperSecretKeyForEcommerceApp2026!WithPlentyOfEntropyAndBits1234567890";
    public string Issuer { get; set; } = "EcommerceApi";
    public string Audience { get; set; } = "EcommerceClient";
    public int AccessTokenExpirationMinutes { get; set; } = 30;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
