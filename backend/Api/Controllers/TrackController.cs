using Api.Application.Services.PhishingTrackingService;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
public class TrackController(
    IConfiguration configuration,
    IPhishingTrackingService phishingTrackingService)
    : ControllerBase
{
    private readonly string _frontendUrl =
        Environment.GetEnvironmentVariable("FRONTEND_URL")
        ?? configuration["FRONTEND_URL"]
        ?? throw new InvalidOperationException("FRONTEND_URL is not configured");

    // Mapping various slugs to a single tracking action for high-fidelity simulation
    [HttpGet("/login/user/{token}")]
    [HttpGet("/view/document/{token}")]
    [HttpGet("/account/verify/{token}")]
    public async Task<IActionResult> TrackClick(string token, CancellationToken cancellationToken)
    {
        var found = await phishingTrackingService.TrackClickAsync(token, cancellationToken);

        if (!found)
            return NotFound("Tracking token not found.");

        return Redirect($"{_frontendUrl}/alert/{token}");
    }
}
