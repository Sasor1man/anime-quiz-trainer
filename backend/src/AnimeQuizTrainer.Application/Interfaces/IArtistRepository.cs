using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IArtistRepository
{
    Task<(IEnumerable<Artist> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Artist?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Artist artist, CancellationToken ct = default);
    void Update(Artist artist);
    void Delete(Artist artist);
}
