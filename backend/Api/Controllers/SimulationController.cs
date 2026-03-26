using Api.Application.DTOs;
using Api.Application.Services.SimulationService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/simulations")]
[Authorize(Roles = "Admin")]
public class SimulationController(ISimulationService simulationService) : ControllerBase
{
    [HttpGet("templates")]
    [ProducesResponseType<List<EmailTemplateSummaryDTO>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EmailTemplateSummaryDTO>>> GetTemplates(
        CancellationToken cancellationToken)
        => Ok(await simulationService.GetTemplatesAsync(cancellationToken));

    [HttpPost("send")]
    [ProducesResponseType<SendSimulationResponseDTO>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SendSimulationResponseDTO>> Send(
        [FromBody] SendSimulationRequestDTO request,
        CancellationToken cancellationToken)
    {
        var result = await simulationService.SendSimulationAsync(request, cancellationToken);

        if (result.Success && result.Response != null)
            return Ok(result.Response);

        return result.Error switch
        {
            SendSimulationError.TemplateNotFound => NotFound(new ProblemDetails
            {
                Title = "Email template not found",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status404NotFound
            }),
            SendSimulationError.UserNotFound => NotFound(new ProblemDetails
            {
                Title = "Target user not found",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status404NotFound
            }),
            SendSimulationError.UnsupportedTemplateSlug => BadRequest(new ProblemDetails
            {
                Title = "Unsupported template slug",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest
            }),
            SendSimulationError.EmailDeliveryFailed => StatusCode(StatusCodes.Status502BadGateway, new ProblemDetails
            {
                Title = "Email delivery failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status502BadGateway
            }),
            _ => BadRequest(new ProblemDetails
            {
                Title = "Simulation request failed",
                Detail = "The simulation could not be processed.",
                Status = StatusCodes.Status400BadRequest
            })
        };
    }
}
