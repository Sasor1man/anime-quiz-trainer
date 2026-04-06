using AnimeQuizTrainer.Application.DTOs.Anime;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Tag;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class AnimeService(
    IAnimeRepository animes,
    IFranchiseRepository franchises,
    ISeriesRepository seriesRepo,
    ITagRepository tags,
    IUnitOfWork uow) : IAnimeService
{
    public async Task<PagedResult<AnimeDto>> GetListAsync(
        Guid? franchiseId, Guid? seriesId, string? filterText, string? sorting,
        int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await animes.GetPagedAsync(franchiseId, seriesId, filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<AnimeDto>(total, items.Select(ToDto));
    }

    public async Task<AnimeDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var anime = await animes.GetByIdWithTagsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Anime {id} not found.");
        return ToDto(anime);
    }

    public async Task<AnimeDto> CreateAsync(CreateAnimeRequest request, CancellationToken ct = default)
    {
        _ = await franchises.GetByIdAsync(request.FranchiseId, ct)
            ?? throw new KeyNotFoundException($"Franchise {request.FranchiseId} not found.");

        if (request.SeriesId.HasValue)
            _ = await seriesRepo.GetByIdAsync(request.SeriesId.Value, ct)
                ?? throw new KeyNotFoundException($"Series {request.SeriesId} not found.");

        var anime = new Anime
        {
            Title = request.Title,
            TitleEn = request.TitleEn,
            FranchiseId = request.FranchiseId,
            SeriesId = request.SeriesId,
            Type = request.Type,
            SeasonNumber = request.SeasonNumber
        };

        if (request.TagIds?.Count > 0)
        {
            var tagList = await tags.GetByIdsAsync(request.TagIds, ct);
            anime.AnimeTags = tagList.Select(t => new AnimeTag { Tag = t }).ToList();
        }

        await animes.AddAsync(anime, ct);
        await uow.SaveChangesAsync(ct);

        return await GetByIdAsync(anime.Id, ct);
    }

    public async Task<AnimeDto> UpdateAsync(Guid id, UpdateAnimeRequest request, CancellationToken ct = default)
    {
        var anime = await animes.GetByIdWithTagsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Anime {id} not found.");

        if (anime.FranchiseId != request.FranchiseId)
            _ = await franchises.GetByIdAsync(request.FranchiseId, ct)
                ?? throw new KeyNotFoundException($"Franchise {request.FranchiseId} not found.");

        if (request.SeriesId.HasValue && request.SeriesId != anime.SeriesId)
            _ = await seriesRepo.GetByIdAsync(request.SeriesId.Value, ct)
                ?? throw new KeyNotFoundException($"Series {request.SeriesId} not found.");

        anime.Title = request.Title;
        anime.TitleEn = request.TitleEn;
        anime.FranchiseId = request.FranchiseId;
        anime.SeriesId = request.SeriesId;
        anime.Type = request.Type;
        anime.SeasonNumber = request.SeasonNumber;
        anime.AnimeTags.Clear();

        if (request.TagIds?.Count > 0)
        {
            var tagList = await tags.GetByIdsAsync(request.TagIds, ct);
            anime.AnimeTags = tagList.Select(t => new AnimeTag { AnimeId = anime.Id, TagId = t.Id, Tag = t }).ToList();
        }

        animes.Update(anime);
        await uow.SaveChangesAsync(ct);

        return await GetByIdAsync(anime.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var anime = await animes.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Anime {id} not found.");
        animes.Delete(anime);
        await uow.SaveChangesAsync(ct);
    }

    private static AnimeDto ToDto(Anime a) => new(
        a.Id, a.Title, a.TitleEn, a.Type, a.SeasonNumber,
        a.FranchiseId, a.Franchise.Name,
        a.SeriesId, a.Series?.Name,
        a.CreatedAt,
        a.AnimeTags.Select(at => new TagDto(at.Tag.Id, at.Tag.Name)).ToList());
}
