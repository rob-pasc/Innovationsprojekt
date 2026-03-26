using Api.Application.DTOs;

namespace Api.Application.Services.SimulationService;

public interface ISimulationService
{
    Task<SendSimulationResult> SendSimulationAsync(
        SendSimulationRequestDTO request,
        CancellationToken cancellationToken = default);

    Task<List<EmailTemplateSummaryDTO>> GetTemplatesAsync(
        CancellationToken cancellationToken = default);
}
