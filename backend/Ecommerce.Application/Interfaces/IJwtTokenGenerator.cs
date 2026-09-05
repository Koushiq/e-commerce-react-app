using System;
using System.Collections.Generic;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles);
    RefreshToken GenerateRefreshToken(Guid userId);
}
