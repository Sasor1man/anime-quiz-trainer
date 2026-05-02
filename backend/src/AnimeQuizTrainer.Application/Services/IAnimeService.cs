using AnimeQuizTrainer.Application.DTOs.Anime;
using AnimeQuizTrainer.Application.DTOs.Common;

namespace AnimeQuizTrainer.Application.Services;

public interface IAnimeService
{
    Task<PagedResult<AnimeDto>> GetListAsync(
        Guid? franchiseId, string? filterText, string? sorting,
        int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<AnimeDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AnimeDto> CreateAsync(CreateAnimeRequest request, CancellationToken ct = default);
    Task<AnimeDto> UpdateAsync(Guid id, UpdateAnimeRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
