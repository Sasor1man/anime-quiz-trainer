using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Franchise> Franchises => Set<Franchise>();
    public DbSet<Anime> Animes => Set<Anime>();
    public DbSet<AnimeEntry> AnimeEntries => Set<AnimeEntry>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<AnimeTag> AnimeTags => Set<AnimeTag>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Song> Songs => Set<Song>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserSongProgress> UserSongProgresses => Set<UserSongProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
