using Api.Application.DTOs;
using Api.Application.Mapper;
using Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Application.Services.AuthService;

public class UserManagementService(UserManager<ApplicationUser> userManager)
    : IUserManagementService
{
    public async Task<UserDTO?> GetCurrentUserAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var role = await GetRoleStringAsync(user);
        return user.ToUserDTO(role);
    }

    public async Task<UserDTO?> CompleteOnboardingAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        user.OnboardingCompleted = true;
        await userManager.UpdateAsync(user);

        var role = await GetRoleStringAsync(user);
        return user.ToUserDTO(role);
    }

    private async Task<string> GetRoleStringAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        return roles.Contains("Admin") ? "admin"
             : roles.Contains("Moderator") ? "moderator"
             : "user";
    }
}
