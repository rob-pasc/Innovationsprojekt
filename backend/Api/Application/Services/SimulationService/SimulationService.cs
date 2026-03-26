using Api.Application.DTOs;
using Api.Application.Repositories;
using Api.Application.Services.MailgunService;
using Api.Application.Services.TrackingLinkService;
using Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;

namespace Api.Application.Services.SimulationService;

public class SimulationService(
    IEmailTemplateRepository emailTemplateRepository,
    IPhishingAttemptRepository phishingAttemptRepository,
    UserManager<ApplicationUser> userManager,
    IMailgunService mailgunService,
    ITrackingLinkService trackingLinkService) : ISimulationService
{
    public async Task<SendSimulationResult> SendSimulationAsync(
        SendSimulationRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var template = await emailTemplateRepository.FindByIdAsync(request.TemplateId, cancellationToken);

        if (template == null)
        {
            return new SendSimulationResult
            {
                Error = SendSimulationError.TemplateNotFound,
                ErrorMessage = "Email template not found."
            };
        }

        var user = await userManager.FindByEmailAsync(request.TargetEmail);
        if (user == null)
        {
            return new SendSimulationResult
            {
                Error = SendSimulationError.UserNotFound,
                ErrorMessage = "Target user not found."
            };
        }

        var trackingToken = GenerateTrackingToken();
        if (!trackingLinkService.TryBuildTrackedLink(template.Slug, trackingToken, out var trackingLink))
        {
            return new SendSimulationResult
            {
                Error = SendSimulationError.UnsupportedTemplateSlug,
                ErrorMessage = $"Template slug '{template.Slug}' is not mapped to a supported tracking route."
            };
        }

        var emailBody = trackingLinkService.InjectTrackedLink(template.BodyHtml, trackingLink);

        var attempt = new PhishingAttempt
        {
            UserId = user.Id,
            TemplateId = template.Id,
            TrackingToken = trackingToken,
            Status = PhishingStatus.Pending
        };

        await phishingAttemptRepository.AddAsync(attempt, cancellationToken);

        try
        {
            await mailgunService.SendPhishingEmailAsync(
                request.TargetEmail,
                template.Subject,
                emailBody,
                template.SenderName,
                cancellationToken);
        }
        catch (Exception ex)
        {
            return new SendSimulationResult
            {
                Error = SendSimulationError.EmailDeliveryFailed,
                ErrorMessage = $"Email delivery failed: {ex.Message}"
            };
        }

        attempt.Status = PhishingStatus.Sent;
        attempt.SentAt = DateTime.UtcNow;
        await phishingAttemptRepository.UpdateAsync(attempt, cancellationToken);

        return new SendSimulationResult
        {
            Success = true,
            Response = new SendSimulationResponseDTO
            {
                AttemptId = attempt.Id,
                TargetEmail = request.TargetEmail,
                UserId = user.Id,
                TemplateId = template.Id,
                TemplateName = template.Name,
                TemplateSlug = template.Slug,
                TrackingToken = trackingToken,
                TrackingLink = trackingLink,
                SentAt = attempt.SentAt ?? throw new InvalidOperationException("SentAt should be populated after a successful Mailgun send."),
                Status = attempt.Status.ToString(),
                Message = "Simulation email sent successfully."
            }
        };
    }

    public async Task<List<EmailTemplateSummaryDTO>> GetTemplatesAsync(
        CancellationToken cancellationToken = default)
    {
        var templates = await emailTemplateRepository.GetAllAsync(cancellationToken);
        return templates.Select(t => new EmailTemplateSummaryDTO
        {
            Id = t.Id,
            Name = t.Name,
            Subject = t.Subject,
            SenderName = t.SenderName,
            DifficultyScore = t.DifficultyScore
        }).ToList();
    }

    private static string GenerateTrackingToken()
        => Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
}
