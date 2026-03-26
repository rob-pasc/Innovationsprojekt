using Api.Domain.Entities;

namespace Api.Application.Repositories;

public interface IEmailTemplateRepository
{
    Task<EmailTemplate?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
