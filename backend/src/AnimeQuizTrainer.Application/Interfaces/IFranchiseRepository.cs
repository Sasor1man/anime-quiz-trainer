using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IFranchiseRepository
{
    Task<(IEnumerable<Franchise> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Franchise?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Franchise franchise, CancellationToken ct = default);
    void Update(Franchise franchise);
    void Delete(Franchise franchise);
}
