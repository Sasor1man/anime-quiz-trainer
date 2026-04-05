using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class ProgressRepository(AppDbContext db) : IProgressRepository
{
    private IQueryable<UserOpeningProgress> WithIncludes() =>
        db.UserOpeningProgresses
            .Include(p => p.Opening).ThenInclude(o => o.Anime)
            .Include(p => p.Opening).ThenInclude(o => o.Artist);

    public async Task<UserOpeningProgress?> GetAsync(Guid userId, Guid openingId, CancellationToken ct = default) =>
        await db.UserOpeningProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.OpeningId == openingId, ct);

    public async Task<IEnumerable<UserOpeningProgress>> GetAvailableAsync(Guid userId, long currentPosition, CancellationToken ct = default) =>
        await WithIncludes()
            .Where(p => p.UserId == userId && p.NextShowPosition <= currentPosition)
            .OrderBy(p => p.EaseFactor)
            .ToListAsync(ct);

    public async Task<IEnumerable<UserOpeningProgress>> GetAllByUserAsync(Guid userId, CancellationToken ct = default) =>
        await WithIncludes()
            .Where(p => p.UserId == userId)
            .ToListAsync(ct);

    public async Task AddAsync(UserOpeningProgress progress, CancellationToken ct = default) =>
        await db.UserOpeningProgresses.AddAsync(progress, ct);

    public void Update(UserOpeningProgress progress) => db.UserOpeningProgresses.Update(progress);
}
