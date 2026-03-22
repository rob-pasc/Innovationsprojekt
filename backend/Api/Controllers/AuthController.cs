using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Application.DTOs;
using Api.Application.Mapper;
using Api.Application.Services.AuthService;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using Api.Domain.Entities;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, UserManager<ApplicationUser> userManager) 
    : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
            return BadRequest(result);

        return StatusCode(201, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(request);

        if (!result.Success)
            return Unauthorized(result);

        return Ok(result);
    }

    [HttpPost("complete-onboarding")]
    [Authorize]
    public async Task<IActionResult> CompleteOnboarding()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        user.OnboardingCompleted = true;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "admin"
                 : roles.Contains("Moderator") ? "moderator"
                 : "user";

        return Ok(user.ToUserDTO(role));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "admin"
                 : roles.Contains("Moderator") ? "moderator"
                 : "user";

        return Ok(user.ToUserDTO(role));
    }
}
