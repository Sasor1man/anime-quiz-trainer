using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IAnimeEntryRepository
{
    Task<(IEnumerable<AnimeEntry> Items, int TotalCount)> GetPagedAsync(
        Guid? animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<AnimeEntry?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AnimeEntry?> GetByIdWithAnimeAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(AnimeEntry entry, CancellationToken ct = default);
    void Update(AnimeEntry entry);
    void Delete(AnimeEntry entry);
}
