using System.Text.Json;

namespace Api.Application.DTOs;

// ── Manifest ──────────────────────────────────────────────────────────────────

public record GameConfigDTO
{
    public List<string> Tags { get; init; } = [];
    public int DifficultyScore { get; init; }
    public int UserLevel { get; init; }
    public string TemplateName { get; init; } = string.Empty;
}

public record GameManifestResponseDTO
{
    public Guid GameModuleId { get; init; }
    public string GameType { get; init; } = string.Empty;   // e.g. "phishing-detective"
    public string Version { get; init; } = "1.0";
    public GameConfigDTO Config { get; init; } = new();
}

// ── Save Game ─────────────────────────────────────────────────────────────────

public record SaveGameRequestDTO
{
    public string Token { get; init; } = string.Empty;   // PhishingAttempt.TrackingToken
    public Guid GameModuleId { get; init; }               // which game module was played
    public int Score { get; init; }                       // 0–100
    public JsonElement? StateData { get; init; }          // optional game replay data
}

public record SaveGameResponseDTO
{
    public int XpAwarded { get; init; }
    public int TotalPoints { get; init; }
    public int ExpLvl { get; init; }
    public bool IsRemediated { get; init; }
    public string Message { get; init; } = string.Empty;
}
