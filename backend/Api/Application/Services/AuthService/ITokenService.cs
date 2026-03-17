using Api.Domain.Entities;

namespace Api.Application.Services.AuthService
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(ApplicationUser user);
    }
}