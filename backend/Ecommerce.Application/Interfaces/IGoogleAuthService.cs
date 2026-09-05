using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces;

public class GoogleUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PictureUrl { get; set; }
    public string Subject { get; set; } = string.Empty;
}

public interface IGoogleAuthService
{
    Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken);
}
