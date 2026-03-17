namespace Api.Application.DTOs;

public class UserDTO
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int ExpLvl { get; set; }
    public bool OnboardingCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
}
