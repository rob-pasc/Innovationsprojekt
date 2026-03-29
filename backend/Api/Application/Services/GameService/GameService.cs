using Api.Application.DTOs;
using Api.Application.Mapper;
using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Application.Services.GameService;

public class GameService(
    IGameModuleRepository gameModuleRepository,
    ISaveGameRepository saveGameRepository,
    IPhishingAttemptRepository phishingAttemptRepository,
    UserManager<ApplicationUser> userManager,
    InnovationsprojektDbContext db) : IGameService
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
        var quizModule      = await gameModuleRepository.FindByTypeAsync(ModuleType.PhishingEmailQuiz);
        var forensicsModule = await gameModuleRepository.FindByTypeAsync(ModuleType.PhishingEmailForensics);
        if (quizModule == null || forensicsModule == null) return null;

        return new GameManifestResponseDTO
        {
            GameType = "phishing-detective",
            Version  = "1.0",
            Config   = new GameConfigDTO
            {
                Tags              = attempt.Template.Tags,
                DifficultyScore   = attempt.Template.DifficultyScore,
                UserLevel         = user.ExpLvl,
                TemplateName      = attempt.Template.Name,
                QuizModuleId      = quizModule.Id,
                ForensicsModuleId = forensicsModule.Id
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

        // XP formula: score is 0–100 (percentage), maps to 0–350 XP.
        // Difficulty acts as a small multiplier (1× → 2× over the range 1–3).
        // Wrong verdict / zero score deliberately awards 0 XP.
        int xpAwarded = (int)Math.Round(dto.Score * 3.5 * (1.0 + (attempt.Template.DifficultyScore - 1) * 0.15));

        // Wrap all writes in a single atomic transaction.
        // CreateExecutionStrategy() is required when EnableRetryOnFailure is active.
        SaveGame saveGame = null!;
        await db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync();

            // Update user stats (500 XP per level — matches Dashboard progress bar)
            user.TotalPoints += xpAwarded;
            user.ExpLvl       = (user.TotalPoints / 500) + 1;
            user.UpdatedAt    = DateTime.UtcNow;
            await userManager.UpdateAsync(user);

            // Mark attempt remediated
            attempt.Status = PhishingStatus.Remediated;
            await phishingAttemptRepository.UpdateAsync(attempt);

            // Persist SaveGame record
            saveGame = new SaveGame
            {
                UserId          = userId,
                GameModuleId    = dto.GameModuleId,
                Score           = dto.Score,
                XpAwarded       = xpAwarded,
                DifficultyLevel = attempt.Template.DifficultyScore,
                StateData       = dto.StateData.HasValue ? dto.StateData.Value.GetRawText() : null
            };
            await saveGameRepository.AddAsync(saveGame);

            await tx.CommitAsync();
        });

        return saveGame.ToSaveGameResponseDTO(user, xpAwarded);
    }
}
