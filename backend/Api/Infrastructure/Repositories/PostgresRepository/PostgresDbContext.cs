using Microsoft.EntityFrameworkCore;
using Api.Domain.Entities;

namespace Api.Infrastructure.Repositories.PostgresRepository;

public class PostgresDbContext(DbContextOptions<PostgresDbContext> options) 
    : DbContext(options)
{
    // Core Entities for the Phishing Simulation and Gamification
    public DbSet<User> Users { get; set; }
    public DbSet<PhishingAttempt> PhishingAttempts { get; set; }
    public DbSet<EmailTemplate> EmailTemplates { get; set; }
    public DbSet<LureDomain> LureDomains { get; set; }
    public DbSet<SaveGame> SaveGames { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique(); // UK from ER Diagram
            entity.Property(u => u.TotalPoints).HasDefaultValue(0);
            entity.Property(u => u.ExpLvl).HasDefaultValue(1);
        });

        // PhishingAttempt Configuration
        modelBuilder.Entity<PhishingAttempt>(entity =>
        {
            entity.HasIndex(pa => pa.TrackingToken).IsUnique(); // UK from ER Diagram
            
            // Relationships
            entity.HasOne(pa => pa.User)
                .WithMany(u => u.PhishingAttempts)
                .HasForeignKey(pa => pa.UserId);

            entity.HasOne(pa => pa.Template)
                .WithMany()
                .HasForeignKey(pa => pa.TemplateId);
        });

        // SaveGame Configuration (Handling JSONB for state_data)
        modelBuilder.Entity<SaveGame>(entity =>
        {
            entity.Property(sg => sg.StateData).HasColumnType("jsonb"); // As specified in ER Diagram
            
            entity.HasOne(sg => sg.User)
                .WithMany(u => u.SaveGames)
                .HasForeignKey(sg => sg.UserId);
        });

        // LureDomain Configuration
        modelBuilder.Entity<LureDomain>(entity =>
        {
            entity.HasIndex(ld => ld.DomainName).IsUnique();
        });
    }
}