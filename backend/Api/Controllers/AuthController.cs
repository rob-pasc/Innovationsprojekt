using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Application.DTOs;
using Api.Application.Services.AuthService;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IUserManagementService userManagementService)
    : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await authService.RegisterAsync(request);

        if (!result.Success)
            return BadRequest(result);

        return StatusCode(201, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await authService.LoginAsync(request);

        if (!result.Success)
            return Unauthorized(result);

        return Ok(result);
    }

    [HttpPost("complete-onboarding")]
    [Authorize]
    public async Task<IActionResult> CompleteOnboarding()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var userDto = await userManagementService.CompleteOnboardingAsync(userId);
        if (userDto == null) return NotFound();

        return Ok(userDto);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var userDto = await userManagementService.GetCurrentUserAsync(userId);
        if (userDto == null) return NotFound();

        return Ok(userDto);
    }

    private string? GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
}
