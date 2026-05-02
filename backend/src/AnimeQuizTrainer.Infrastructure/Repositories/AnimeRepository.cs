using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class AnimeRepository(AppDbContext db) : IAnimeRepository
{
    public async Task<(IEnumerable<Anime> Items, int TotalCount)> GetPagedAsync(
        Guid? franchiseId, string? filterText, string? sorting,
        int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.Animes
            .Include(a => a.Franchise)
            .Include(a => a.AnimeTags).ThenInclude(at => at.Tag)
            .AsQueryable();

        if (franchiseId.HasValue)
            query = query.Where(a => a.FranchiseId == franchiseId.Value);

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(a => a.Title.Contains(filterText) || (a.TitleEn != null && a.TitleEn.Contains(filterText)));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "title desc"     => query.OrderByDescending(a => a.Title),
            "titleen"        => query.OrderBy(a => a.TitleEn),
            "titleen desc"   => query.OrderByDescending(a => a.TitleEn),
            "createdat"      => query.OrderBy(a => a.CreatedAt),
            "createdat desc" => query.OrderByDescending(a => a.CreatedAt),
            _                => query.OrderBy(a => a.Title)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Anime?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Animes.FindAsync([id], ct);

    public async Task<Anime?> GetByIdWithTagsAsync(Guid id, CancellationToken ct = default) =>
        await db.Animes
            .Include(a => a.Franchise)
            .Include(a => a.AnimeTags).ThenInclude(at => at.Tag)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task AddAsync(Anime anime, CancellationToken ct = default) =>
        await db.Animes.AddAsync(anime, ct);

    public void Update(Anime anime) => db.Animes.Update(anime);

    public void Delete(Anime anime) => db.Animes.Remove(anime);
}
