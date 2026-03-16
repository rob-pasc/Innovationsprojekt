using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires authentication
    public class ProtectedController : ControllerBase
    {
        [HttpGet("user-only")]
        [Authorize(Roles = "User")]
        public IActionResult UserOnlyEndpoint()
        {
            return Ok(new { message = "You have User role" });
        }

        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok(new { message = "You have Admin role" });
        }

        [HttpGet("admin-or-moderator")]
        [Authorize(Roles = "Admin,Moderator")]
        public IActionResult AdminOrModeratorEndpoint()
        {
            return Ok(new { message = "You have Admin or Moderator role" });
        }
    }
}