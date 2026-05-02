using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface ISongRepository
{
    Task<IEnumerable<Song>> GetAllAsync(CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<(IEnumerable<Song> Items, int TotalCount)> GetPagedAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<Song?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<Song> Items, int TotalCount)> GetPagedByAnimeEntryIdAsync(
        Guid animeEntryId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<IEnumerable<Song>> GetFilteredAsync(
        IEnumerable<Difficulty>? difficulties,
        IEnumerable<Guid>? tagIds,
        IEnumerable<SongType>? songTypes,
        int? limit,
        CancellationToken ct = default);
    Task AddAsync(Song song, CancellationToken ct = default);
    void Update(Song song);
    void Delete(Song song);
}
