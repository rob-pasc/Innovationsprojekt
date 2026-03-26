using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;

namespace Api.Infrastructure.Repositories;

public class SaveGameRepository(InnovationsprojektDbContext db)
    : ISaveGameRepository
{
    private readonly InnovationsprojektDbContext _db = db;

    public async Task AddAsync(SaveGame saveGame, CancellationToken cancellationToken = default)
    {
        await _db.SaveGames.AddAsync(saveGame, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
