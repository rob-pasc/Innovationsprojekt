using System.Net.Http.Headers;
using System.Text;

namespace Api.Application.Services.MailgunService;

public class MailgunService(HttpClient httpClient, IConfiguration configuration) : IMailgunService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly string _apiKey = Environment.GetEnvironmentVariable("MAILGUN_API_KEY")
        ?? configuration["MAILGUN_API_KEY"]
        ?? throw new InvalidOperationException("MAILGUN_API_KEY is not configured");
    private readonly string _domain = Environment.GetEnvironmentVariable("MAILGUN_DOMAIN")
        ?? configuration["MAILGUN_DOMAIN"]
        ?? throw new InvalidOperationException("MAILGUN_DOMAIN is not configured");
    private readonly string _fromEmail = Environment.GetEnvironmentVariable("MAILGUN_FROM_EMAIL")
        ?? configuration["MAILGUN_FROM_EMAIL"]
        ?? throw new InvalidOperationException("MAILGUN_FROM_EMAIL is not configured");
        // instead of hardcoding the from email, we can also consider making it dynamic based on the template or sender name
        // any ...@{_domain} email should work 

    public async Task SendPhishingEmailAsync(
        string targetEmail,
        string subject,
        string htmlBody,
        string senderName,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"https://api.mailgun.net/v3/{_domain}/messages");

        var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{_apiKey}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
        request.Content = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("from", $"{senderName} <{_fromEmail}>"),
            new KeyValuePair<string, string>("to", targetEmail),
            new KeyValuePair<string, string>("subject", subject),
            new KeyValuePair<string, string>("html", htmlBody)
        ]);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Mailgun send failed with status {(int)response.StatusCode}: {responseBody}");
        }
    }
}
