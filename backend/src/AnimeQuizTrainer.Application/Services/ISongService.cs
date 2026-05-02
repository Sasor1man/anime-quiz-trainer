using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Song;

namespace AnimeQuizTrainer.Application.Services;

public interface ISongService
{
    Task<PagedResult<SongDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<SongDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<SongDto>> GetListByAnimeEntryIdAsync(
        Guid animeEntryId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<SongDto> CreateAsync(CreateSongRequest request, CancellationToken ct = default);
    Task<SongDto> UpdateAsync(Guid id, UpdateSongRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
