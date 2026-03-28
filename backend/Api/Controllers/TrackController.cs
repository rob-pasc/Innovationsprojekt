using Api.Application.Hubs;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
public class TrackController(
    IConfiguration configuration,
    InnovationsprojektDbContext dbContext,
    IHubContext<SimulationHub> hubContext)
    : ControllerBase
{
    private readonly InnovationsprojektDbContext _dbContext = dbContext;
    private readonly IHubContext<SimulationHub> _hubContext = hubContext;

    private readonly string _frontendUrl =
        Environment.GetEnvironmentVariable("FRONTEND_URL")
        ?? configuration["FRONTEND_URL"]
        ?? throw new InvalidOperationException("FRONTEND_URL is not configured");

    [HttpGet("/login/user/{token}")]
    [HttpGet("/view/document/{token}")]
    [HttpGet("/account/verify/{token}")]
    public async Task<IActionResult> TrackClick(string token, CancellationToken cancellationToken)
    {
        var attempt = await _dbContext.PhishingAttempts
            .Include(p => p.Template)
            .Include(p => p.User)
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

            await _hubContext.Clients.All.SendAsync("SimulationClicked", new
            {
                attemptId = attempt.Id,
                trackingToken = attempt.TrackingToken,
                clickedAt = attempt.ClickedAt,
                status = attempt.Status.ToString(),
                targetEmail = attempt.User?.Email,
                templateName = attempt.Template?.Name
            }, CancellationToken.None);
        }

        return Redirect($"{_frontendUrl}/alert/{token}");
    }
}