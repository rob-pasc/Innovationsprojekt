using System.ComponentModel.DataAnnotations;

namespace Api.Application.DTOs;

public record SendSimulationRequestDTO
{
    [Required]
    [EmailAddress]
    public string TargetEmail { get; init; } = string.Empty;

    [Required]
    public Guid TemplateId { get; init; }
}
