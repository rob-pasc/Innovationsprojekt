using Api.Domain;
using Api.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Persistence;

public class InnovationsprojektDbContext(DbContextOptions<InnovationsprojektDbContext> options) 
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<PhishingAttempt> PhishingAttempts { get; set; }
    public DbSet<EmailTemplate> EmailTemplates { get; set; }
    public DbSet<SaveGame> SaveGames { get; set; }
    public DbSet<GameModule> GameModules { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<PhishingAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TrackingToken).IsUnique();
            entity.Property(e => e.Status)
                  .HasConversion<string>();
            entity.Property(e => e.SentAt)
                  .IsRequired(false);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Template)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Tags)
                  .HasColumnType("jsonb");
        });

        builder.Entity<SaveGame>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.GameModule)
                  .WithMany()
                  .HasForeignKey(e => e.GameModuleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.StateData)
                  .HasColumnType("jsonb")
                  .IsRequired(false);
        });

        builder.Entity<GameModule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type)
                  .HasConversion<string>();
            entity.Property(e => e.Paths)
                  .HasColumnType("jsonb")
                  .IsRequired(false);
        });
    }
}
