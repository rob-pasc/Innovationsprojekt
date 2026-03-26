namespace Api.Application.DTOs;

public record EmailTemplateSummaryDTO
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public int DifficultyScore { get; init; }
}
