using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Series;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class SeriesService(ISeriesRepository seriesRepo, IFranchiseRepository franchises, IUnitOfWork uow) : ISeriesService
{
    public async Task<PagedResult<SeriesDto>> GetListAsync(
        Guid? franchiseId, string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await seriesRepo.GetPagedAsync(franchiseId, filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<SeriesDto>(total, items.Select(ToDto));
    }

    public async Task<SeriesDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var series = await seriesRepo.GetByIdWithFranchiseAsync(id, ct)
            ?? throw new KeyNotFoundException($"Series {id} not found.");
        return ToDto(series);
    }

    public async Task<SeriesDto> CreateAsync(CreateSeriesRequest request, CancellationToken ct = default)
    {
        _ = await franchises.GetByIdAsync(request.FranchiseId, ct)
            ?? throw new KeyNotFoundException($"Franchise {request.FranchiseId} not found.");

        var series = new Series { Name = request.Name, NameEn = request.NameEn, FranchiseId = request.FranchiseId };
        await seriesRepo.AddAsync(series, ct);
        await uow.SaveChangesAsync(ct);

        return await GetByIdAsync(series.Id, ct);
    }

    public async Task<SeriesDto> UpdateAsync(Guid id, CreateSeriesRequest request, CancellationToken ct = default)
    {
        var series = await seriesRepo.GetByIdWithFranchiseAsync(id, ct)
            ?? throw new KeyNotFoundException($"Series {id} not found.");

        if (series.FranchiseId != request.FranchiseId)
            _ = await franchises.GetByIdAsync(request.FranchiseId, ct)
                ?? throw new KeyNotFoundException($"Franchise {request.FranchiseId} not found.");

        series.Name = request.Name;
        series.NameEn = request.NameEn;
        series.FranchiseId = request.FranchiseId;
        seriesRepo.Update(series);
        await uow.SaveChangesAsync(ct);

        return await GetByIdAsync(series.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var series = await seriesRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Series {id} not found.");
        seriesRepo.Delete(series);
        await uow.SaveChangesAsync(ct);
    }

    private static SeriesDto ToDto(Series s) =>
        new(s.Id, s.Name, s.NameEn, s.FranchiseId, s.Franchise.Name, s.CreatedAt);
}
