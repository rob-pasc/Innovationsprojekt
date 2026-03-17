using Api.Application.DTOs;
using Api.Application.Repositories;

namespace Api.Application.Services.RecoveryService;

public class RecoveryService(IPhishingAttemptRepository phishingAttemptRepository)
    : IRecoveryService
{
    private readonly IPhishingAttemptRepository _phishingAttemptRepository = phishingAttemptRepository;

    public async Task<RecoveryResponseDTO?> GetRecoveryDataAsync(string token)
    {
        var attempt = await _phishingAttemptRepository.FindByTrackingTokenAsync(token);

        if (attempt == null)
            return null;

        // B1 guard: Template should always be populated via Include in the repository,
        // but a data-integrity issue (orphaned PhishingAttempt row) could leave it null.
        // Return null so the controller surfaces a 404 rather than a 500.
        if (attempt.Template == null)
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
