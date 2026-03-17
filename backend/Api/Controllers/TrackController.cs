using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
public class TrackController(IConfiguration configuration) 
    : ControllerBase
{
    private readonly string _frontendUrl =
        Environment.GetEnvironmentVariable("FRONTEND_URL")
            ?? configuration["FRONTEND_URL"]
            ?? throw new InvalidOperationException("FRONTEND_URL is not configured");

    // Mapping various slugs to a single tracking action for high-fidelity simulation
    [HttpGet("/login/user/{token}")]
    [HttpGet("/view/document/{token}")]
    [HttpGet("/account/verify/{token}")]
    public IActionResult TrackClick(string token)
    {
        // Member 1: Log ClickedAt, update status, and broadcast SignalR event to Admin Dashboard.
        // Member 2: Return a 302 Redirect to the React recovery page for tag-based training.

        return Redirect($"{_frontendUrl}/alert/{token}");
    }
}
