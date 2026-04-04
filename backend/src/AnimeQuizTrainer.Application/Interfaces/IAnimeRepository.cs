using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IAnimeRepository
{
    Task<(IEnumerable<Anime> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Anime?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Anime?> GetByIdWithTagsAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Anime anime, CancellationToken ct = default);
    void Update(Anime anime);
    void Delete(Anime anime);
}
