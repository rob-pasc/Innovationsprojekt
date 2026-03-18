using Api.Application.DTOs;
using Api.Application.Mapper;
using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace Api.Application.Services.GameService;

public class GameService(
    InnovationsprojektDbContext db,
    UserManager<ApplicationUser> userManager,
    IPhishingAttemptRepository phishingAttemptRepository) : IGameService
{
    // ── Manifest ──────────────────────────────────────────────────────────────

    public async Task<GameManifestResponseDTO?> GetManifestAsync(string userId, string token)
    {
        var attempt = await phishingAttemptRepository.FindByTrackingTokenAsync(token);
        if (attempt == null) return null;

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        // Decision logic: for MVP only one game type exists.
        // Future: inspect attempt.Template.Tags and user.ExpLvl to pick the most effective variant.
        var gameType = "phishing-detective";

        return new GameManifestResponseDTO
        {
            GameType = gameType,
            Version  = "1.0",
            Config   = new GameConfigDTO
            {
                Tags            = attempt.Template.Tags,
                DifficultyScore = attempt.Template.DifficultyScore,
                UserLevel       = user.ExpLvl,
                TemplateName    = attempt.Template.Name
            }
        };
    }

    // ── Save Game ─────────────────────────────────────────────────────────────

    public async Task<SaveGameResponseDTO?> SaveGameAsync(string userId, SaveGameRequestDTO dto)
    {
        var attempt = await phishingAttemptRepository.FindByTrackingTokenAsync(dto.Token);
        if (attempt == null) return null;

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        // Idempotency: return current stats without awarding XP again
        if (attempt.Status == PhishingStatus.Remediated)
        {
            return new SaveGameResponseDTO
            {
                XpAwarded    = 0,
                TotalPoints  = user.TotalPoints,
                ExpLvl       = user.ExpLvl,
                IsRemediated = true,
                Message      = "Training already completed."
            };
        }

        // XP formula: floor of 5 ensures a reward for any completion
        int xpAwarded = Math.Max(5, dto.Score * attempt.Template.DifficultyScore / 10);

        // Update user stats (500 XP per level — matches Dashboard progress bar)
        user.TotalPoints += xpAwarded;
        user.ExpLvl       = (user.TotalPoints / 500) + 1;
        user.UpdatedAt    = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        // Mark attempt remediated
        attempt.Status = PhishingStatus.Remediated;
        db.PhishingAttempts.Update(attempt);

        // Persist SaveGame record
        var saveGame = new SaveGame
        {
            UserId          = userId,
            AttemptId       = attempt.Id,
            Score           = dto.Score,
            XpAwarded       = xpAwarded,
            DifficultyLevel = attempt.Template.DifficultyScore,
            StateData       = dto.StateData.HasValue ? dto.StateData.Value.GetRawText() : null
        };
        await db.SaveGames.AddAsync(saveGame);

        // Single SaveChangesAsync — atomically flushes attempt status update + new SaveGame row
        await db.SaveChangesAsync();

        return saveGame.ToSaveGameResponseDTO(user, xpAwarded);
    }
}
