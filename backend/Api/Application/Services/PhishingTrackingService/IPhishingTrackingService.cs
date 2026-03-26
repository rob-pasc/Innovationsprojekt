namespace Api.Application.Services.PhishingTrackingService;

public interface IPhishingTrackingService
{
    /// <summary>
    /// Records a click on a phishing tracking link.
    /// Returns false if the token does not match any known attempt.
    /// </summary>
    Task<bool> TrackClickAsync(string token, CancellationToken cancellationToken = default);
}
