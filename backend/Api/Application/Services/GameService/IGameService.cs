using Api.Application.DTOs;

namespace Api.Application.Services.GameService;

public interface IGameService
{
    Task<GameManifestResponseDTO?> GetManifestAsync(string userId, string token);
    Task<SaveGameResponseDTO?> SaveGameAsync(string userId, SaveGameRequestDTO dto);
}
