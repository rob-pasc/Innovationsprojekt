using Api.Application.DTOs;

namespace Api.Application.Services.RecoveryService;

public interface IRecoveryService
{
    Task<RecoveryResponseDTO?> GetRecoveryDataAsync(string token);
}