using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class FranchiseRepository(AppDbContext db) : IFranchiseRepository
{
    public async Task<(IEnumerable<Franchise> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.Franchises.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(f => f.Name.Contains(filterText) || (f.NameEn != null && f.NameEn.Contains(filterText)));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "name desc"   => query.OrderByDescending(f => f.Name),
            "nameen"      => query.OrderBy(f => f.NameEn),
            "nameen desc" => query.OrderByDescending(f => f.NameEn),
            _             => query.OrderBy(f => f.Name)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Franchise?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Franchises.FindAsync([id], ct);

    public async Task AddAsync(Franchise franchise, CancellationToken ct = default) =>
        await db.Franchises.AddAsync(franchise, ct);

    public void Update(Franchise franchise) => db.Franchises.Update(franchise);

    public void Delete(Franchise franchise) => db.Franchises.Remove(franchise);
}
