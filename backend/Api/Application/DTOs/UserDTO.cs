namespace Api.Application.DTOs;

public record UserDTO
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public int TotalPoints { get; init; }
    public int ExpLvl { get; init; }
    public bool OnboardingCompleted { get; init; }
    public DateTime CreatedAt { get; init; }
}
