using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Api.Infrastructure.Persistence;

/// <summary>
/// Used only by EF Core tooling (dotnet ef migrations) at design time.
/// The connection string here is a placeholder — actual credentials come from .env at runtime.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<InnovationsprojektDbContext>
{
    public InnovationsprojektDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<InnovationsprojektDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=design_time_db;Username=postgres;Password=postgres");
        return new InnovationsprojektDbContext(optionsBuilder.Options);
    }
}
