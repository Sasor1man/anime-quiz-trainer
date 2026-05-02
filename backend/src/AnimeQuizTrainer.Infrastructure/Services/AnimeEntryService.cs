using AnimeQuizTrainer.Application.DTOs.AnimeEntry;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class AnimeEntryService(
    IAnimeEntryRepository entries,
    IAnimeRepository animes,
    IUnitOfWork uow) : IAnimeEntryService
{
    public async Task<PagedResult<AnimeEntryDto>> GetListAsync(
        Guid? animeId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await entries.GetPagedAsync(animeId, filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<AnimeEntryDto>(total, items.Select(ToDto));
    }

    public async Task<AnimeEntryDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entry = await entries.GetByIdWithAnimeAsync(id, ct)
            ?? throw new KeyNotFoundException($"AnimeEntry {id} not found.");
        return ToDto(entry);
    }

    public async Task<AnimeEntryDto> CreateAsync(CreateAnimeEntryRequest request, CancellationToken ct = default)
    {
        _ = await animes.GetByIdAsync(request.AnimeId, ct)
            ?? throw new KeyNotFoundException($"Anime {request.AnimeId} not found.");

        var entry = new AnimeEntry
        {
            Title = request.Title,
            TitleEn = request.TitleEn,
            Type = request.Type,
            AnimeId = request.AnimeId
        };

        await entries.AddAsync(entry, ct);
        await uow.SaveChangesAsync(ct);
        return await GetByIdAsync(entry.Id, ct);
    }

    public async Task<AnimeEntryDto> UpdateAsync(Guid id, UpdateAnimeEntryRequest request, CancellationToken ct = default)
    {
        var entry = await entries.GetByIdWithAnimeAsync(id, ct)
            ?? throw new KeyNotFoundException($"AnimeEntry {id} not found.");

        if (entry.AnimeId != request.AnimeId)
            _ = await animes.GetByIdAsync(request.AnimeId, ct)
                ?? throw new KeyNotFoundException($"Anime {request.AnimeId} not found.");

        entry.Title = request.Title;
        entry.TitleEn = request.TitleEn;
        entry.Type = request.Type;
        entry.AnimeId = request.AnimeId;

        entries.Update(entry);
        await uow.SaveChangesAsync(ct);
        return await GetByIdAsync(entry.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entry = await entries.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"AnimeEntry {id} not found.");
        entries.Delete(entry);
        await uow.SaveChangesAsync(ct);
    }

    private static AnimeEntryDto ToDto(AnimeEntry e) =>
        new(e.Id, e.Title, e.TitleEn, e.Type, e.AnimeId, e.Anime.Title, e.CreatedAt);
}
