using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class ProgressRepository(AppDbContext db) : IProgressRepository
{
    private IQueryable<UserSongProgress> WithIncludes() =>
        db.UserSongProgresses
            .Include(p => p.Song).ThenInclude(s => s.AnimeEntry).ThenInclude(e => e.Anime)
            .Include(p => p.Song).ThenInclude(s => s.Artist);

    public async Task<UserSongProgress?> GetAsync(Guid userId, Guid songId, CancellationToken ct = default) =>
        await db.UserSongProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.SongId == songId, ct);

    public async Task<IEnumerable<UserSongProgress>> GetAvailableAsync(Guid userId, long currentPosition, CancellationToken ct = default) =>
        await WithIncludes()
            .Where(p => p.UserId == userId && p.NextShowPosition <= currentPosition)
            .OrderBy(p => p.EaseFactor)
            .ToListAsync(ct);

    public async Task<IEnumerable<UserSongProgress>> GetAllByUserAsync(Guid userId, CancellationToken ct = default) =>
        await WithIncludes()
            .Where(p => p.UserId == userId)
            .ToListAsync(ct);

    public async Task AddAsync(UserSongProgress progress, CancellationToken ct = default) =>
        await db.UserSongProgresses.AddAsync(progress, ct);

    public void Update(UserSongProgress progress) => db.UserSongProgresses.Update(progress);
}
