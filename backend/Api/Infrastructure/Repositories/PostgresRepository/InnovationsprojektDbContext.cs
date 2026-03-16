using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Api.Domain;

namespace Api.Infrastructure.Repositories
{
    public class InnovationsprojektDbContext : IdentityDbContext<ApplicationUser>
    {
        public InnovationsprojektDbContext(DbContextOptions<InnovationsprojektDbContext> options)
            : base(options) { }

        // Application-specific DbSets
        //public DbSet<PhishingAttempt> PhishingAttempts { get; set; }
        //public DbSet<EmailTemplate> EmailTemplates { get; set; }
        //public DbSet<SaveGame> SaveGames { get; set; }
        //public DbSet<LureDomain> LureDomains { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // IMPORTANT: Call base first!

            // Configure IdentityUser tables (AspNetUsers, AspNetRoles, AspNetUserRoles, etc.)
            // Then add your custom configurations below...

            // Example: Configure PhishingAttempt
            //builder.Entity<PhishingAttempt>(entity =>
            //{
            //    entity.HasKey(e => e.Id);
            //    entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            //    entity.HasOne(e => e.User)
            //        .WithMany()
            //        .HasForeignKey("UserId");
            //});
        }
    }
}