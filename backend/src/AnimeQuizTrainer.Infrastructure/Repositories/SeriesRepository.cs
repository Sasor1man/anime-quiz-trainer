using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class SeriesRepository(AppDbContext db) : ISeriesRepository
{
    public async Task<(IEnumerable<Series> Items, int TotalCount)> GetPagedAsync(
        Guid? franchiseId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.Series.Include(s => s.Franchise).AsQueryable();

        if (franchiseId.HasValue)
            query = query.Where(s => s.FranchiseId == franchiseId.Value);

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(s => s.Name.Contains(filterText) || (s.NameEn != null && s.NameEn.Contains(filterText)));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "name desc"   => query.OrderByDescending(s => s.Name),
            "nameen"      => query.OrderBy(s => s.NameEn),
            "nameen desc" => query.OrderByDescending(s => s.NameEn),
            _             => query.OrderBy(s => s.Name)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Series?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Series.FindAsync([id], ct);

    public async Task<Series?> GetByIdWithFranchiseAsync(Guid id, CancellationToken ct = default) =>
        await db.Series.Include(s => s.Franchise).FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task AddAsync(Series series, CancellationToken ct = default) =>
        await db.Series.AddAsync(series, ct);

    public void Update(Series series) => db.Series.Update(series);

    public void Delete(Series series) => db.Series.Remove(series);
}
