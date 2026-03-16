using Api.Domain;
using Api.Application.DTOs;

namespace Api.Application.Services.AuthService
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO request);
        Task<AuthResponseDTO> LoginAsync(LoginRequestDTO request);
    }
}