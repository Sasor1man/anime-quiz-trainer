using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class SongRepository(AppDbContext db) : ISongRepository
{
    private IQueryable<Song> WithIncludes() =>
        db.Songs
            .Include(s => s.AnimeEntry).ThenInclude(e => e.Anime)
            .Include(s => s.Artist);

    public async Task<IEnumerable<Song>> GetAllAsync(CancellationToken ct = default) =>
        await WithIncludes().OrderBy(s => s.AnimeEntry.Anime.Title).ThenBy(s => s.AnimeEntry.Title).ThenBy(s => s.Type).ThenBy(s => s.OrderNumber).ToListAsync(ct);

    public async Task<(IEnumerable<Song> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = WithIncludes().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(s => s.SongTitle.Contains(filterText)
                || s.AnimeEntry.Title.Contains(filterText)
                || s.AnimeEntry.Anime.Title.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "songtitle"           => query.OrderBy(s => s.SongTitle).ThenBy(s => s.OrderNumber),
            "songtitle desc"      => query.OrderByDescending(s => s.SongTitle).ThenBy(s => s.OrderNumber),
            "animetitle desc"     => query.OrderByDescending(s => s.AnimeEntry.Anime.Title).ThenBy(s => s.OrderNumber),
            "ordernumber"         => query.OrderBy(s => s.OrderNumber),
            "ordernumber desc"    => query.OrderByDescending(s => s.OrderNumber),
            _                     => query.OrderBy(s => s.AnimeEntry.Anime.Title).ThenBy(s => s.AnimeEntry.Title).ThenBy(s => s.Type).ThenBy(s => s.OrderNumber)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Song?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<(IEnumerable<Song> Items, int TotalCount)> GetPagedByAnimeEntryIdAsync(
        Guid animeEntryId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = WithIncludes().Where(s => s.AnimeEntryId == animeEntryId);

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(s => s.SongTitle.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "songtitle"        => query.OrderBy(s => s.SongTitle),
            "songtitle desc"   => query.OrderByDescending(s => s.SongTitle),
            "ordernumber desc" => query.OrderByDescending(s => s.OrderNumber),
            _                  => query.OrderBy(s => s.Type).ThenBy(s => s.OrderNumber)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<IEnumerable<Song>> GetFilteredAsync(
        IEnumerable<Difficulty>? difficulties,
        IEnumerable<Guid>? tagIds,
        IEnumerable<SongType>? songTypes,
        int? limit,
        CancellationToken ct = default)
    {
        var query = WithIncludes()
            .Include(s => s.AnimeEntry).ThenInclude(e => e.Anime).ThenInclude(a => a.AnimeTags)
            .AsQueryable();

        if (difficulties?.Any() == true)
            query = query.Where(s => difficulties.Contains(s.Difficulty));

        if (tagIds?.Any() == true)
            query = query.Where(s => s.AnimeEntry.Anime.AnimeTags.Any(at => tagIds.Contains(at.TagId)));

        if (songTypes?.Any() == true)
            query = query.Where(s => songTypes.Contains(s.Type));

        query = query.OrderBy(_ => EF.Functions.Random());

        if (limit.HasValue)
            query = query.Take(limit.Value);

        return await query.ToListAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default) =>
        await db.Songs.CountAsync(ct);

    public async Task AddAsync(Song song, CancellationToken ct = default) =>
        await db.Songs.AddAsync(song, ct);

    public void Update(Song song) => db.Songs.Update(song);

    public void Delete(Song song) => db.Songs.Remove(song);
}
