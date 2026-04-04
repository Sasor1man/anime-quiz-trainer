using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class ArtistService(IArtistRepository artists, IUnitOfWork uow) : IArtistService
{
    public async Task<PagedResult<ArtistDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await artists.GetPagedAsync(filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<ArtistDto>(total, items.Select(ToDto));
    }

    public async Task<ArtistDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var artist = await artists.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Artist {id} not found.");
        return ToDto(artist);
    }

    public async Task<ArtistDto> CreateAsync(CreateArtistRequest request, CancellationToken ct = default)
    {
        var artist = new Artist { Name = request.Name };
        await artists.AddAsync(artist, ct);
        await uow.SaveChangesAsync(ct);
        return ToDto(artist);
    }

    public async Task<ArtistDto> UpdateAsync(Guid id, CreateArtistRequest request, CancellationToken ct = default)
    {
        var artist = await artists.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Artist {id} not found.");
        artist.Name = request.Name;
        artists.Update(artist);
        await uow.SaveChangesAsync(ct);
        return ToDto(artist);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var artist = await artists.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Artist {id} not found.");
        artists.Delete(artist);
        await uow.SaveChangesAsync(ct);
    }

    private static ArtistDto ToDto(Artist a) => new(a.Id, a.Name);
}
