using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Api.Application.Hubs;

[Authorize(Roles = "Admin")]
public class SimulationHub : Hub
{
}