using Api.Application.Services.RecoveryService;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/recovery")]
public class RecoveryController : ControllerBase
{
    private readonly IRecoveryService _recoveryService;

    public RecoveryController(IRecoveryService recoveryService)
    {
        _recoveryService = recoveryService;
    }

    [HttpGet("{token}")]
    public async Task<IActionResult> GetRecoveryData(string token)
    {
        var result = await _recoveryService.GetRecoveryDataAsync(token);

        if (result == null)
            return NotFound(new { message = "Invalid or expired recovery token." });

        return Ok(result);
    }
}