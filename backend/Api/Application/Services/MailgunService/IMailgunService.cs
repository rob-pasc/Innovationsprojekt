namespace Api.Application.Services.MailgunService;

public interface IMailgunService
{
    Task SendPhishingEmailAsync(
        string targetEmail,
        string subject,
        string htmlBody,
        string senderName,
        CancellationToken cancellationToken = default);
}
