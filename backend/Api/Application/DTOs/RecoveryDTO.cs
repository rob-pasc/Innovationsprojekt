using Api.Domain.Entities;

namespace Api.Application.DTOs;

public class RecoveryResponseDTO
{
    // The phishing attempt details
    public Guid AttemptId { get; set; }
    public PhishingStatus Status { get; set; }
    public DateTime? ClickedAt { get; set; }

    // The template that caught them — what the UI needs to explain the red flags
    public string TemplateName { get; set; } = string.Empty;
    public string TemplateSubject { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
    public int DifficultyScore { get; set; }
}