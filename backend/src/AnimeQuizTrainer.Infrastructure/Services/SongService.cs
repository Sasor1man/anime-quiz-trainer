using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Song;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class SongService(
    ISongRepository songs,
    IAnimeEntryRepository entries,
    IArtistRepository artists,
    IUnitOfWork uow) : ISongService
{
    public async Task<PagedResult<SongDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await songs.GetPagedAsync(filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<SongDto>(total, items.Select(ToDto));
    }

    public async Task<SongDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var song = await songs.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Song {id} not found.");
        return ToDto(song);
    }

    public async Task<PagedResult<SongDto>> GetListByAnimeEntryIdAsync(
        Guid animeEntryId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await songs.GetPagedByAnimeEntryIdAsync(animeEntryId, filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<SongDto>(total, items.Select(ToDto));
    }

    public async Task<SongDto> CreateAsync(CreateSongRequest request, CancellationToken ct = default)
    {
        _ = await entries.GetByIdAsync(request.AnimeEntryId, ct)
            ?? throw new KeyNotFoundException($"AnimeEntry {request.AnimeEntryId} not found.");
        _ = await artists.GetByIdAsync(request.ArtistId, ct)
            ?? throw new KeyNotFoundException($"Artist {request.ArtistId} not found.");

        var song = new Song
        {
            AnimeEntryId = request.AnimeEntryId,
            ArtistId = request.ArtistId,
            SongTitle = request.SongTitle,
            YoutubeUrl = request.YoutubeUrl,
            Type = request.Type,
            OrderNumber = request.OrderNumber,
            Difficulty = request.Difficulty,
            StartTiming = request.StartTiming,
            ChorusTiming = request.ChorusTiming
        };

        await songs.AddAsync(song, ct);
        await uow.SaveChangesAsync(ct);

        return ToDto((await songs.GetByIdAsync(song.Id, ct))!);
    }

    public async Task<SongDto> UpdateAsync(Guid id, UpdateSongRequest request, CancellationToken ct = default)
    {
        var song = await songs.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Song {id} not found.");

        _ = await artists.GetByIdAsync(request.ArtistId, ct)
            ?? throw new KeyNotFoundException($"Artist {request.ArtistId} not found.");

        song.ArtistId = request.ArtistId;
        song.SongTitle = request.SongTitle;
        song.YoutubeUrl = request.YoutubeUrl;
        song.Type = request.Type;
        song.OrderNumber = request.OrderNumber;
        song.Difficulty = request.Difficulty;
        song.StartTiming = request.StartTiming;
        song.ChorusTiming = request.ChorusTiming;

        songs.Update(song);
        await uow.SaveChangesAsync(ct);

        return ToDto((await songs.GetByIdAsync(song.Id, ct))!);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var song = await songs.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Song {id} not found.");
        songs.Delete(song);
        await uow.SaveChangesAsync(ct);
    }

    public static SongDto ToDto(Song s) => new(
        s.Id,
        s.AnimeEntryId,
        s.AnimeEntry.Title,
        s.AnimeEntry.AnimeId,
        s.AnimeEntry.Anime.Title,
        new ArtistDto(s.Artist.Id, s.Artist.Name),
        s.SongTitle,
        s.YoutubeUrl,
        s.Type,
        s.OrderNumber,
        s.Difficulty,
        s.StartTiming,
        s.ChorusTiming,
        s.CreatedAt);
}
