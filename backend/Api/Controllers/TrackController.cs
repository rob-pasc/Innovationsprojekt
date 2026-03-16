using DotNetEnv;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Api.Controller;

[ApiController]
public class TrackController : ControllerBase
{
    private readonly IConfiguration _config;

    public TrackController(IConfiguration config)
    {
        _config = config;
    }

    // Mapping various slugs to a single tracking action for high-fidelity simulation
    [HttpGet("/login/user/{token}")]
    [HttpGet("/view/document/{token}")]
    [HttpGet("/account/verify/{token}")]
    public async Task<IActionResult> TrackClick(string token)
    {
        // Member 1: Log ClickedAt, update status, and broadcast SignalR event to Admin Dashboard.
        // Member 2: Return a 302 Redirect to the React recovery page for tag-based training.


        // Get the frontend URL from environment variables
        try
        {
            Env.Load();
            Console.WriteLine("✓ Loaded .env file");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠ Warning: Error loading .env file: {ex.Message}");
        }
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
            ?? throw new InvalidOperationException("FRONTEND_URL environment variable not found");

        // Redirect to frontend with a flag
        return Redirect($"{frontendUrl}/alert/{token}");
    }
}
