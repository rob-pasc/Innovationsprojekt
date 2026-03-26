using Api.Application.DTOs;

namespace Api.Application.Services.AuthService;

public interface IUserManagementService
{
    Task<UserDTO?> GetCurrentUserAsync(string userId);
    Task<UserDTO?> CompleteOnboardingAsync(string userId);
}
