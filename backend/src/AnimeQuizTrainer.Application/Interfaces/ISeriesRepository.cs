using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface ISeriesRepository
{
    Task<(IEnumerable<Series> Items, int TotalCount)> GetPagedAsync(
        Guid? franchiseId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Series?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Series?> GetByIdWithFranchiseAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Series series, CancellationToken ct = default);
    void Update(Series series);
    void Delete(Series series);
}
