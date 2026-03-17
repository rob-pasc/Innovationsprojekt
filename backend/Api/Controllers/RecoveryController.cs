using Api.Application.DTOs;
using Api.Domain;
using Api.Infrastructure.Repositories;
using Api.Infrastructure.Repositories.PostgresRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecoveryController(InnovationsprojektDbContext db) 
    : ControllerBase
{
    private readonly InnovationsprojektDbContext _db = db;

    /// GET /api/recovery/{token}
    /// Looks up a PhishingAttempt by its tracking token and returns
    /// the template tags needed to explain the red flags to the user.
    /// No auth required — the token itself is the credential.
    [HttpGet("{token}")]
    public async Task<IActionResult> GetRecoveryData(string token)
    {
        var attempt = await _db.PhishingAttempts
            .Include(a => a.Template)
            .FirstOrDefaultAsync(a => a.TrackingToken == token);

        if (attempt == null)
            return NotFound(new { message = "Invalid or expired recovery token." });

        // If already remediated, still return data — frontend can show a "already completed" state
        var response = new RecoveryResponseDTO
        {
            AttemptId = attempt.Id,
            Status = attempt.Status,
            ClickedAt = attempt.ClickedAt,
            TemplateName = attempt.Template.Name,
            TemplateSubject = attempt.Template.Subject,
            SenderName = attempt.Template.SenderName,
            Tags = attempt.Template.Tags,
            DifficultyScore = attempt.Template.DifficultyScore,
        };

        return Ok(response);
    }
}