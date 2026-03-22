namespace Api.Application.Services.TrackingLinkService;

public interface ITrackingLinkService
{
    bool TryBuildTrackedLink(string templateSlug, string trackingToken, out string trackedLink);
    string InjectTrackedLink(string htmlBody, string trackedLink);
}
