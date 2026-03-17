using Api.Domain.Entities;

namespace Api.Application.Repositories;

public interface IPhishingAttemptRepository
{
    Task<PhishingAttempt?> FindByTrackingTokenAsync(string token);
}
