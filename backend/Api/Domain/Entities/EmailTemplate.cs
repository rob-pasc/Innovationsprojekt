namespace Api.Domain.Entities;

public class EmailTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;

    // e.g. ["urgency", "bad_grammar", "spoofed_sender"]
    public List<string> Tags { get; set; } = [];

    public int DifficultyScore { get; set; } = 1;
}