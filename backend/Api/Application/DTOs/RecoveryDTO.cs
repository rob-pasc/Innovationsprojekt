using Api.Domain.Entities;

namespace Api.Application.DTOs;

public record RecoveryResponseDTO
{
    // The phishing attempt details
    public Guid AttemptId { get; init; }
    public PhishingStatus Status { get; init; }
    public DateTime? ClickedAt { get; init; }

    // The template that caught them — what the UI needs to explain the red flags
    public string TemplateName { get; init; } = string.Empty;
    public string TemplateSubject { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = [];
    public int DifficultyScore { get; init; }
}
