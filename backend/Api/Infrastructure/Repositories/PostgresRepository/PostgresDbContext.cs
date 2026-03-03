using LectureEvaluationAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LectureEvaluationAPI.Infrastructure.Repositories.PostgresRepository;

public class PostgresDbContext(DbContextOptions<PostgresDbContext> options) 
    : DbContext(options)
{
    public DbSet<Lecture> Lectures { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
}
