using Api.Application.DTOs;

namespace Api.Application.Services.SimulationService;

public enum SendSimulationError
{
    None,
    TemplateNotFound,
    UserNotFound,
    UnsupportedTemplateSlug
}

public record SendSimulationResult
{
    public bool Success { get; init; }
    public SendSimulationError Error { get; init; }
    public string ErrorMessage { get; init; } = string.Empty;
    public SendSimulationResponseDTO? Response { get; init; }
}
