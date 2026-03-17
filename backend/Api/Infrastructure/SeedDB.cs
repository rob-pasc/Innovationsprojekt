using Microsoft.AspNetCore.Identity;
using Api.Domain.Entities;

namespace Api.Infrastructure
{
    public static class SeedDB
    {
        public static async Task Initialize(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Create roles if they don't exist
            string[] roleNames = { "Admin", "Moderator", "User" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                    Console.WriteLine($"✓ Created role: {roleName}");
                }
            }

            // Create admin user if it doesn't exist
            var adminEmail = "admin@Innovationsprojekt.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    TotalPoints = 0,
                    ExpLvl = 1,
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

            // Create test user if it doesn't exist
            var testEmail = "user@Innovationsprojekt.com";
            var testUser = await userManager.FindByEmailAsync(testEmail);

            if (testUser == null)
            {
                testUser = new ApplicationUser
                {
                    UserName = testEmail,
                    Email = testEmail,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    TotalPoints = 0,
                    ExpLvl = 1,
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
        }
    }
}