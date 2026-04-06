using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Franchise> Franchises => Set<Franchise>();
    public DbSet<Series> Series => Set<Series>();
    public DbSet<Anime> Animes => Set<Anime>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<AnimeTag> AnimeTags => Set<AnimeTag>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Opening> Openings => Set<Opening>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserOpeningProgress> UserOpeningProgresses => Set<UserOpeningProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
