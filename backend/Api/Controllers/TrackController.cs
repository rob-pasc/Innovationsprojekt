using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
public class TrackController(
    IConfiguration configuration,
    InnovationsprojektDbContext dbContext)
    : ControllerBase
{
    private readonly InnovationsprojektDbContext _dbContext = dbContext;

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
        var attempt = await _dbContext.PhishingAttempts
            .FirstOrDefaultAsync(p => p.TrackingToken == token, cancellationToken);

        if (attempt is null)
        {
            return NotFound("Tracking token not found.");
        }

        if (attempt.ClickedAt is null)
        {
            attempt.ClickedAt = DateTime.UtcNow;
            attempt.Status = PhishingStatus.Clicked;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Redirect($"{_frontendUrl}/alert/{token}");
    }
}