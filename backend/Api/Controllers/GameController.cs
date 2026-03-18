using Api.Application.DTOs;
using Api.Application.Services.GameService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace Api.Controllers;

[ApiController]
[Route("api/games")]
[Authorize]
public class GameController(IGameService gameService) : ControllerBase
{
    // ── Manifest ──────────────────────────────────────────────────────────────

    [HttpGet("manifest")]
    public async Task<IActionResult> GetManifest([FromQuery] string token)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (userId == null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token is required." });

        var result = await gameService.GetManifestAsync(userId, token);
        if (result == null)
            return NotFound(new { message = "Phishing attempt not found." });

        return Ok(result);
    }

    // ── Save Game ─────────────────────────────────────────────────────────────

    [HttpPut("savegame")]
    public async Task<IActionResult> SaveGame([FromBody] SaveGameRequestDTO dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (userId == null) return Unauthorized();

        var result = await gameService.SaveGameAsync(userId, dto);
        if (result == null)
            return NotFound(new { message = "Phishing attempt not found or invalid token." });

        return Ok(result);
    }
}
