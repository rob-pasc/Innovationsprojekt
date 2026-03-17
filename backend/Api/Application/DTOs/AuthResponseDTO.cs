namespace Api.Application.DTOs;

public record AuthResponseDTO
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? Token { get; init; }
    public UserDTO? User { get; init; }
}
