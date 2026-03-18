namespace Api.Domain.Entities;

public class SaveGame
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public Guid AttemptId { get; set; }
    public PhishingAttempt Attempt { get; set; } = null!;

    public int Score { get; set; }           // 0–100
    public int XpAwarded { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public int DifficultyLevel { get; set; } = 1;
    public string? StateData { get; set; }   // JSON string, stored as jsonb; null is fine for MVP
}
