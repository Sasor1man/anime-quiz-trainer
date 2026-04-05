using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IOpeningRepository
{
    Task<IEnumerable<Opening>> GetAllAsync(CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<(IEnumerable<Opening> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Opening?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<Opening> Items, int TotalCount)> GetPagedByAnimeIdAsync(
        Guid animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<IEnumerable<Opening>> GetFilteredAsync(
        IEnumerable<Difficulty>? difficulties,
        IEnumerable<Guid>? tagIds,
        int? limit,
        CancellationToken ct = default);
    Task AddAsync(Opening opening, CancellationToken ct = default);
    void Update(Opening opening);
    void Delete(Opening opening);
}
