using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;

namespace Api.Infrastructure;

public static class SeedDB
{
    // ── Known dev constants ────────────────────────────────────────────────────
    // Fixed GUIDs so re-runs never create duplicates and the token is easy to type.
    private static readonly Guid DevTemplateId    = Guid.Parse("aaaaaaaa-0000-0000-0000-000000000001");
    private static readonly Guid DevAttemptId     = Guid.Parse("bbbbbbbb-0000-0000-0000-000000000001");
    private static readonly Guid DevGameModuleId  = Guid.Parse("cccccccc-0000-0000-0000-000000000001");
    public  const string DevTrackingToken         = "dev-phishing-test-001";

    public static async Task Initialize(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        InnovationsprojektDbContext db)
    {
        // ── Roles ──────────────────────────────────────────────────────────────
        string[] roleNames = { "Admin", "Moderator", "User" };

        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
                Console.WriteLine($"✓ Created role: {roleName}");
            }
        }

        // ── Admin user ─────────────────────────────────────────────────────────
        var adminEmail = "admin@Innovationsprojekt.com";
        var adminUser  = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName           = adminEmail,
                Email              = adminEmail,
                EmailConfirmed     = true,
                CreatedAt          = DateTime.UtcNow,
                UpdatedAt          = DateTime.UtcNow,
                TotalPoints        = 0,
                ExpLvl             = 1,
                OnboardingCompleted = false
            };

            // B6 (known issue): Password is hardcoded in source and will appear in git history.
            // For production, read from an environment variable (e.g. SEED_ADMIN_PASSWORD)
            // and exclude this seeding block from production deployments entirely.
            var result = await userManager.CreateAsync(adminUser, "SecurePassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRolesAsync(adminUser, new[] { "Admin", "Moderator", "User" });
                Console.WriteLine($"✓ Created admin user: {adminEmail}");
            }
            else
            {
                Console.WriteLine($"✗ Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        // ── Test user ──────────────────────────────────────────────────────────
        var testEmail = "user@Innovationsprojekt.com";
        var testUser  = await userManager.FindByEmailAsync(testEmail);

        if (testUser == null)
        {
            testUser = new ApplicationUser
            {
                UserName           = testEmail,
                Email              = testEmail,
                EmailConfirmed     = true,
                CreatedAt          = DateTime.UtcNow,
                UpdatedAt          = DateTime.UtcNow,
                TotalPoints        = 0,
                ExpLvl             = 1,
                OnboardingCompleted = false
            };

            // B6 (known issue): same hardcoded-credential issue as admin above.
            var result = await userManager.CreateAsync(testUser, "TestPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(testUser, "User");
                Console.WriteLine($"✓ Created test user: {testEmail}");
            }
            else
            {
                Console.WriteLine($"✗ Failed to create test user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        // ── Dev GameModule ─────────────────────────────────────────────────────
        // One module per game type; new types are added here as the platform grows.
        if (await db.GameModules.FindAsync(DevGameModuleId) == null)
        {
            db.GameModules.Add(new GameModule
            {
                Id    = DevGameModuleId,
                Type  = ModuleType.PhishingDetective,
                Paths = null
            });

            await db.SaveChangesAsync();
            Console.WriteLine($"✓ Seeded dev GameModule: PhishingDetective (id={DevGameModuleId})");
        }

        // ── Dev EmailTemplate ──────────────────────────────────────────────────
        // Fixed ID so this block is idempotent across restarts.
        if (await db.EmailTemplates.FindAsync(DevTemplateId) == null)
        {
            db.EmailTemplates.Add(new EmailTemplate
            {
                Id            = DevTemplateId,
                Name          = "HR Password Reset",
                Subject       = "Urgent: Your password expires today",
                SenderName    = "IT Support",
                Slug          = "login-user",
                BodyHtml      = "<p>Dear Employee,</p>"
                              + "<p>Your password <strong>expires today</strong>. "
                              + "Click the link below immediately to avoid losing access.</p>"
                              + "<p><a href='#'>Reset Password Now</a></p>"
                              + "<p>Regards,<br>IT Support Team</p>",
                Tags          = ["urgency", "spoofed_sender", "bad_grammar"],
                DifficultyScore = 3
            });

            await db.SaveChangesAsync();
            Console.WriteLine($"✓ Seeded dev EmailTemplate: \"HR Password Reset\" (id={DevTemplateId})");
        }

        // ── Dev PhishingAttempt ────────────────────────────────────────────────
        // Tied to the test user. Status = Clicked so it represents a user who
        // already opened the link and landed on AlertPage.
        // Re-fetch the test user to guarantee we have their DB-assigned Id.
        var currentTestUser = await userManager.FindByEmailAsync(testEmail);

        if (currentTestUser != null
            && !await db.PhishingAttempts.AnyAsync(a => a.TrackingToken == DevTrackingToken))
        {
            db.PhishingAttempts.Add(new PhishingAttempt
            {
                Id            = DevAttemptId,
                UserId        = currentTestUser.Id,
                TemplateId    = DevTemplateId,
                TrackingToken = DevTrackingToken,
                SentAt        = DateTime.UtcNow,
                ClickedAt     = DateTime.UtcNow,   // already "clicked" — TrackController not yet wired
                Status        = PhishingStatus.Clicked
            });

            await db.SaveChangesAsync();
            Console.WriteLine($"✓ Seeded dev PhishingAttempt: token = \"{DevTrackingToken}\"");
            Console.WriteLine($"  → AlertPage:  /alert/{DevTrackingToken}");
            Console.WriteLine($"  → Game:       /academy/phishing/detective-game?token={DevTrackingToken}");
        }
    }
}
