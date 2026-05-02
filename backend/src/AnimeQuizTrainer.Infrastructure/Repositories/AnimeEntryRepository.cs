using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class AnimeEntryRepository(AppDbContext db) : IAnimeEntryRepository
{
    public async Task<(IEnumerable<AnimeEntry> Items, int TotalCount)> GetPagedAsync(
        Guid? animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.AnimeEntries.Include(e => e.Anime).AsQueryable();

        if (animeId.HasValue)
            query = query.Where(e => e.AnimeId == animeId.Value);

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(e => e.Title.Contains(filterText) || (e.TitleEn != null && e.TitleEn.Contains(filterText)));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "title desc"     => query.OrderByDescending(e => e.Title),
            "createdat"      => query.OrderBy(e => e.CreatedAt),
            "createdat desc" => query.OrderByDescending(e => e.CreatedAt),
            _                => query.OrderBy(e => e.Title)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<AnimeEntry?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.AnimeEntries.FindAsync([id], ct);

    public async Task<AnimeEntry?> GetByIdWithAnimeAsync(Guid id, CancellationToken ct = default) =>
        await db.AnimeEntries.Include(e => e.Anime).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task AddAsync(AnimeEntry entry, CancellationToken ct = default) =>
        await db.AnimeEntries.AddAsync(entry, ct);

    public void Update(AnimeEntry entry) => db.AnimeEntries.Update(entry);

    public void Delete(AnimeEntry entry) => db.AnimeEntries.Remove(entry);
}
