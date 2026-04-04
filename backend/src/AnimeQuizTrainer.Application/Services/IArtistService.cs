using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Application.DTOs.Common;

namespace AnimeQuizTrainer.Application.Services;

public interface IArtistService
{
    Task<PagedResult<ArtistDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<ArtistDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ArtistDto> CreateAsync(CreateArtistRequest request, CancellationToken ct = default);
    Task<ArtistDto> UpdateAsync(Guid id, CreateArtistRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
