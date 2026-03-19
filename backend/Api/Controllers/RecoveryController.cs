using Api.Application.Services.RecoveryService;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/recovery")]
public class RecoveryController(IRecoveryService recoveryService) 
    : ControllerBase
{
    private readonly IRecoveryService _recoveryService = recoveryService;

    [HttpGet("{token}")]
    public async Task<IActionResult> GetRecoveryData(string token)
    {
        var result = await _recoveryService.GetRecoveryDataAsync(token);

        if (result == null)
            return NotFound(new { message = "Invalid or expired recovery token." });

        return Ok(result);
    }
}