using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Repositories;

public class GameModuleRepository(InnovationsprojektDbContext db)
    : IGameModuleRepository
{
    private readonly InnovationsprojektDbContext _db = db;

    public Task<GameModule?> FindByTypeAsync(ModuleType type, CancellationToken cancellationToken = default)
        => _db.GameModules.FirstOrDefaultAsync(m => m.Type == type, cancellationToken);
}
