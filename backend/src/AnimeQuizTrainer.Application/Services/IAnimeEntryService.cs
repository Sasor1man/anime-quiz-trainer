using AnimeQuizTrainer.Application.DTOs.AnimeEntry;
using AnimeQuizTrainer.Application.DTOs.Common;

namespace AnimeQuizTrainer.Application.Services;

public interface IAnimeEntryService
{
    Task<PagedResult<AnimeEntryDto>> GetListAsync(
        Guid? animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<AnimeEntryDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AnimeEntryDto> CreateAsync(CreateAnimeEntryRequest request, CancellationToken ct = default);
    Task<AnimeEntryDto> UpdateAsync(Guid id, UpdateAnimeEntryRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
