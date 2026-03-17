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
}
