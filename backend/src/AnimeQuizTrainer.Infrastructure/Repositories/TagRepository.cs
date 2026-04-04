using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Repositories;

public class TagRepository(AppDbContext db) : ITagRepository
{
    public async Task<(IEnumerable<Tag> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var query = db.Tags.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterText))
            query = query.Where(t => t.Name.Contains(filterText));

        var total = await query.CountAsync(ct);

        query = sorting?.ToLowerInvariant() switch
        {
            "name desc" => query.OrderByDescending(t => t.Name),
            _           => query.OrderBy(t => t.Name)
        };

        var items = await query.Skip(skipCount).Take(maxResultCount).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Tag?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Tags.FindAsync([id], ct);

    public async Task<IEnumerable<Tag>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default) =>
        await db.Tags.Where(t => ids.Contains(t.Id)).ToListAsync(ct);

    public async Task AddAsync(Tag tag, CancellationToken ct = default) =>
        await db.Tags.AddAsync(tag, ct);

    public void Update(Tag tag) => db.Tags.Update(tag);

    public void Delete(Tag tag) => db.Tags.Remove(tag);
}
