using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Opening;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class OpeningService(
    IOpeningRepository openings,
    IAnimeRepository animes,
    IArtistRepository artists,
    IUnitOfWork uow) : IOpeningService
{
    public async Task<PagedResult<OpeningDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await openings.GetPagedAsync(filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<OpeningDto>(total, items.Select(ToDto));
    }

    public async Task<OpeningDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var opening = await openings.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Opening {id} not found.");
        return ToDto(opening);
    }

    public async Task<PagedResult<OpeningDto>> GetListByAnimeIdAsync(
        Guid animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await openings.GetPagedByAnimeIdAsync(animeId, filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<OpeningDto>(total, items.Select(ToDto));
    }

    public async Task<OpeningDto> CreateAsync(CreateOpeningRequest request, CancellationToken ct = default)
    {
        _ = await animes.GetByIdAsync(request.AnimeId, ct)
            ?? throw new KeyNotFoundException($"Anime {request.AnimeId} not found.");
        _ = await artists.GetByIdAsync(request.ArtistId, ct)
            ?? throw new KeyNotFoundException($"Artist {request.ArtistId} not found.");

        var opening = new Opening
        {
            AnimeId = request.AnimeId,
            ArtistId = request.ArtistId,
            SongTitle = request.SongTitle,
            YoutubeUrl = request.YoutubeUrl,
            OrderNumber = request.OrderNumber,
            Difficulty = request.Difficulty,
            StartTiming = request.StartTiming,
            ChorusTiming = request.ChorusTiming
        };

        await openings.AddAsync(opening, ct);
        await uow.SaveChangesAsync(ct);

        return ToDto((await openings.GetByIdAsync(opening.Id, ct))!);
    }

    public async Task<OpeningDto> UpdateAsync(Guid id, UpdateOpeningRequest request, CancellationToken ct = default)
    {
        var opening = await openings.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Opening {id} not found.");

        _ = await artists.GetByIdAsync(request.ArtistId, ct)
            ?? throw new KeyNotFoundException($"Artist {request.ArtistId} not found.");

        opening.ArtistId = request.ArtistId;
        opening.SongTitle = request.SongTitle;
        opening.YoutubeUrl = request.YoutubeUrl;
        opening.OrderNumber = request.OrderNumber;
        opening.Difficulty = request.Difficulty;
        opening.StartTiming = request.StartTiming;
        opening.ChorusTiming = request.ChorusTiming;

        openings.Update(opening);
        await uow.SaveChangesAsync(ct);

        return ToDto((await openings.GetByIdAsync(opening.Id, ct))!);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var opening = await openings.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Opening {id} not found.");
        openings.Delete(opening);
        await uow.SaveChangesAsync(ct);
    }

    public static OpeningDto ToDto(Opening o) => new(
        o.Id,
        o.AnimeId,
        o.Anime.Title,
        new ArtistDto(o.Artist.Id, o.Artist.Name),
        o.SongTitle,
        o.YoutubeUrl,
        o.OrderNumber,
        o.Difficulty,
        o.StartTiming,
        o.ChorusTiming,
        o.CreatedAt);
}
