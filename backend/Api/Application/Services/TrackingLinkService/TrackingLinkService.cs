namespace Api.Application.Services.TrackingLinkService;

public class TrackingLinkService(IConfiguration configuration) : ITrackingLinkService
{
    private readonly string _backendUrl = Environment.GetEnvironmentVariable("BACKEND_URL")
        ?? configuration["BACKEND_URL"]
        ?? "http://localhost:8080";

    public bool TryBuildTrackedLink(string templateSlug, string trackingToken, out string trackedLink)
    {
        trackedLink = string.Empty;

        if (!TryResolveRoutePath(templateSlug, out var routePath))
            return false;

        trackedLink = $"{_backendUrl.TrimEnd('/')}/{routePath}/{trackingToken}";
        return true;
    }

    public string InjectTrackedLink(string htmlBody, string trackedLink)
    {
        const string placeholder = "{{TRACKING_LINK}}";

        if (htmlBody.Contains(placeholder, StringComparison.OrdinalIgnoreCase))
            return htmlBody.Replace(placeholder, trackedLink, StringComparison.OrdinalIgnoreCase);

        return htmlBody.Replace("href='#'", $"href='{trackedLink}'", StringComparison.OrdinalIgnoreCase);
    }

    private static bool TryResolveRoutePath(string templateSlug, out string routePath)
    {
        var normalizedSlug = templateSlug.Trim().Trim('/').ToLowerInvariant();

        // Assumption for the current vertical slice:
        // EmailTemplate.Slug identifies one of the supported lure-route families.
        // The seeded "hr-password-reset" template behaves like the existing /login/user/{token} route.
        routePath = normalizedSlug switch
        {
            "login-user" or "login/user" or "hr-password-reset" => "login/user",
            "view-document" or "view/document" => "view/document",
            "account-verify" or "account/verify" => "account/verify",
            _ => string.Empty
        };

        return !string.IsNullOrWhiteSpace(routePath);
    }
}
