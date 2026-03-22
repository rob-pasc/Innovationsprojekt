namespace Api.Domain.Entities;

public class GameModule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public ModuleType Type { get; set; }
    public string? Paths { get; set; }   // jsonb; null OK for MVP
}
