using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Series;

namespace AnimeQuizTrainer.Application.Services;

public interface ISeriesService
{
    Task<PagedResult<SeriesDto>> GetListAsync(
        Guid? franchiseId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<SeriesDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SeriesDto> CreateAsync(CreateSeriesRequest request, CancellationToken ct = default);
    Task<SeriesDto> UpdateAsync(Guid id, CreateSeriesRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
