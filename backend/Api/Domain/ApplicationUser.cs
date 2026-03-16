using Microsoft.AspNetCore.Identity;

namespace Api.Domain
{
    public class ApplicationUser : IdentityUser
    {
        public int TotalPoints { get; set; } = 0;

        public int ExpLvl { get; set; } = 1;

        public bool OnboardingCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}