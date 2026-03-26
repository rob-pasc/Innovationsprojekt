using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Repositories;

public class PhishingAttemptRepository(InnovationsprojektDbContext db)
    : IPhishingAttemptRepository
{
    private readonly InnovationsprojektDbContext _db = db;

    public Task<PhishingAttempt?> FindByTrackingTokenAsync(string token)
        => _db.PhishingAttempts
              .Include(a => a.Template)
              .FirstOrDefaultAsync(a => a.TrackingToken == token);

    public async Task AddAsync(PhishingAttempt attempt, CancellationToken cancellationToken = default)
    {
        await _db.PhishingAttempts.AddAsync(attempt, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(PhishingAttempt attempt, CancellationToken cancellationToken = default)
    {
        _db.PhishingAttempts.Update(attempt);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
