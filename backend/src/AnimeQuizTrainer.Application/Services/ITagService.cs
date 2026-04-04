using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Tag;

namespace AnimeQuizTrainer.Application.Services;

public interface ITagService
{
    Task<PagedResult<TagDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<TagDto> CreateAsync(CreateTagRequest request, CancellationToken ct = default);
    Task<TagDto> UpdateAsync(Guid id, CreateTagRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
