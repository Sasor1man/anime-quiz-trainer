using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface ITagRepository
{
    Task<(IEnumerable<Tag> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Tag?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Tag>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
    Task AddAsync(Tag tag, CancellationToken ct = default);
    void Update(Tag tag);
    void Delete(Tag tag);
}
