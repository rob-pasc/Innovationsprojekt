using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controller;

[ApiController]
public class TrackController : ControllerBase
{
    // Mapping various slugs to a single tracking action for high-fidelity simulation
    [HttpGet("/login/user/{token}")]
    [HttpGet("/view/document/{token}")]
    [HttpGet("/account/verify/{token}")]
    public async Task<IActionResult> TrackClick(string token)
    {
        // Member 1: Log ClickedAt, update status, and broadcast SignalR event to Admin Dashboard.
        // Member 2: Return a 302 Redirect to the React recovery page for tag-based training.


        // Get the frontend URL from environment variables
        var frontendUrl = _config["FRONTEND_URL"] ?? "http://localhost:5173";

        // Redirect to frontend with a flag
        return Redirect($"{frontendUrl}?phished=true&token={token}");
    }
}
