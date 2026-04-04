using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class ArtistRepository(AppDbContext db) : IArtistRepository
{
    public async Task<(IEnumerable<Artist> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.Artists.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(a => a.Name.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "name desc" => query.OrderByDescending(a => a.Name),
            _           => query.OrderBy(a => a.Name)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Artist?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Artists.FindAsync([id], ct);

    public async Task AddAsync(Artist artist, CancellationToken ct = default) =>
        await db.Artists.AddAsync(artist, ct);

    public void Update(Artist artist) => db.Artists.Update(artist);

    public void Delete(Artist artist) => db.Artists.Remove(artist);
}
