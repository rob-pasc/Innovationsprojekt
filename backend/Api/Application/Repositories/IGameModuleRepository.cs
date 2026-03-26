using Api.Domain.Entities;

namespace Api.Application.Repositories;

public interface IGameModuleRepository
{
    Task<GameModule?> FindByTypeAsync(ModuleType type, CancellationToken cancellationToken = default);
}
