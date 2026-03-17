using Api.Application.DTOs;
using Api.Infrastructure.Repositories;
using Api.Infrastructure.Repositories.PostgresRepository;
using Microsoft.EntityFrameworkCore;

namespace Api.Application.Services.RecoveryService;

public class RecoveryService(InnovationsprojektDbContext db) 
    : IRecoveryService
{
    private readonly InnovationsprojektDbContext _db = db;

    public async Task<RecoveryResponseDTO?> GetRecoveryDataAsync(string token)
    {
        var attempt = await _db.PhishingAttempts
            .Include(a => a.Template)
            .FirstOrDefaultAsync(a => a.TrackingToken == token);

        if (attempt == null)
            return null;

        return new RecoveryResponseDTO
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
    }
}