using Api.Application.Repositories;
using Api.Domain.Entities;
using Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Repositories;

public class EmailTemplateRepository(InnovationsprojektDbContext db)
    : IEmailTemplateRepository
{
    private readonly InnovationsprojektDbContext _db = db;

    public Task<EmailTemplate?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _db.EmailTemplates.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
}
