using Api.Domain.Entities;

namespace Api.Application.Repositories;

public interface ISaveGameRepository
{
    Task AddAsync(SaveGame saveGame, CancellationToken cancellationToken = default);
}
