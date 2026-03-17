using Api.Application.DTOs;
using Api.Domain.Entities;

namespace Api.Application.Mapper;

public static class DtoMapper
{
    extension(ApplicationUser user)
    {
        public UserDTO ToUserDTO(string role) => new()
        {
            Id = user.Id,
            Email = user.Email!,
            Role = role,
            TotalPoints = user.TotalPoints,
            ExpLvl = user.ExpLvl,
            OnboardingCompleted = user.OnboardingCompleted,
            CreatedAt = user.CreatedAt
        };
    }

    extension(PhishingAttempt attempt)
    {
        public RecoveryResponseDTO ToRecoveryResponseDTO() => new()
        {
            AttemptId = attempt.Id,
            Status = attempt.Status,
            ClickedAt = attempt.ClickedAt,
            TemplateName = attempt.Template.Name,
            TemplateSubject = attempt.Template.Subject,
            SenderName = attempt.Template.SenderName,
            Tags = attempt.Template.Tags,
            DifficultyScore = attempt.Template.DifficultyScore
        };
    }
}
