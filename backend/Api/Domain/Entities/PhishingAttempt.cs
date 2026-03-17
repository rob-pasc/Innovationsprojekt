using Api.Domain.Entities;
using System.Text.Json.Serialization;

namespace Api.Domain.Entities;

public enum PhishingStatus
{
    Sent,
    Clicked,
    Remediated
}

public class PhishingAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public Guid TemplateId { get; set; }
    public EmailTemplate Template { get; set; } = null!;

    public string TrackingToken { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClickedAt { get; set; }
    public DateTime? OpenedAt { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PhishingStatus Status { get; set; } = PhishingStatus.Sent;
}