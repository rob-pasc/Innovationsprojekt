using Api.Application.Repositories;
using Api.Domain.Entities;

namespace Api.Application.Services.PhishingTrackingService;

public class PhishingTrackingService(IPhishingAttemptRepository phishingAttemptRepository)
    : IPhishingTrackingService
{
    public async Task<bool> TrackClickAsync(string token, CancellationToken cancellationToken = default)
    {
        var attempt = await phishingAttemptRepository.FindByTrackingTokenAsync(token);
        if (attempt is null) return false;

        if (attempt.ClickedAt is null)
        {
            attempt.ClickedAt = DateTime.UtcNow;
            attempt.Status = PhishingStatus.Clicked;
            await phishingAttemptRepository.UpdateAsync(attempt, cancellationToken);
        }

        return true;
    }
}
