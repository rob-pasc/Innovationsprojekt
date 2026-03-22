namespace Api.Application.DTOs;

public record SendSimulationResponseDTO
{
    public Guid AttemptId { get; init; }
    public string TargetEmail { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public Guid TemplateId { get; init; }
    public string TemplateName { get; init; } = string.Empty;
    public string TemplateSlug { get; init; } = string.Empty;
    public string TrackingToken { get; init; } = string.Empty;
    public string TrackingLink { get; init; } = string.Empty;
    public DateTime SentAt { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}
