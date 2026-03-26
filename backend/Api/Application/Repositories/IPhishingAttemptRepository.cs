using Api.Domain.Entities;

namespace Api.Application.Repositories;

public interface IPhishingAttemptRepository
{
    Task<PhishingAttempt?> FindByTrackingTokenAsync(string token);
    Task AddAsync(PhishingAttempt attempt, CancellationToken cancellationToken = default);
    Task UpdateAsync(PhishingAttempt attempt, CancellationToken cancellationToken = default);
}
