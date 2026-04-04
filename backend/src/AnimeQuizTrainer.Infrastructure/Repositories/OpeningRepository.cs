using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class OpeningRepository(AppDbContext db) : IOpeningRepository
{
    private IQueryable<Opening> WithIncludes() =>
        db.Openings.Include(o => o.Anime).Include(o => o.Artist);

    public async Task<IEnumerable<Opening>> GetAllAsync(CancellationToken ct = default) =>
        await WithIncludes().OrderBy(o => o.Anime.Title).ThenBy(o => o.OrderNumber).ToListAsync(ct);

    public async Task<(IEnumerable<Opening> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = WithIncludes().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(o => o.SongTitle.Contains(filterText) || o.Anime.Title.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "songtitle"        => query.OrderBy(o => o.SongTitle).ThenBy(o => o.OrderNumber),
            "songtitle desc"   => query.OrderByDescending(o => o.SongTitle).ThenBy(o => o.OrderNumber),
            "animetitle desc"  => query.OrderByDescending(o => o.Anime.Title).ThenBy(o => o.OrderNumber),
            "ordernumber"      => query.OrderBy(o => o.OrderNumber),
            "ordernumber desc" => query.OrderByDescending(o => o.OrderNumber),
            _                  => query.OrderBy(o => o.Anime.Title).ThenBy(o => o.OrderNumber)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Opening?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<(IEnumerable<Opening> Items, int TotalCount)> GetPagedByAnimeIdAsync(
        Guid animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = WithIncludes().Where(o => o.AnimeId == animeId);

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(o => o.SongTitle.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "songtitle"        => query.OrderBy(o => o.SongTitle),
            "songtitle desc"   => query.OrderByDescending(o => o.SongTitle),
            "ordernumber desc" => query.OrderByDescending(o => o.OrderNumber),
            _                  => query.OrderBy(o => o.OrderNumber)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<IEnumerable<Opening>> GetFilteredAsync(
        IEnumerable<Difficulty>? difficulties,
        IEnumerable<Guid>? tagIds,
        int? limit,
        CancellationToken ct = default)
    {
        var query = WithIncludes()
            .Include(o => o.Anime).ThenInclude(a => a.AnimeTags)
            .AsQueryable();

        if (difficulties?.Any() == true)
            query = query.Where(o => difficulties.Contains(o.Difficulty));

        if (tagIds?.Any() == true)
            query = query.Where(o => o.Anime.AnimeTags.Any(at => tagIds.Contains(at.TagId)));

        query = query.OrderBy(_ => EF.Functions.Random());

        if (limit.HasValue)
            query = query.Take(limit.Value);

        return await query.ToListAsync(ct);
    }

    public async Task AddAsync(Opening opening, CancellationToken ct = default) =>
        await db.Openings.AddAsync(opening, ct);

    public void Update(Opening opening) => db.Openings.Update(opening);

    public void Delete(Opening opening) => db.Openings.Remove(opening);
}
