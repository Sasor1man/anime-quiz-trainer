using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Franchise;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class FranchiseService(IFranchiseRepository franchises, IUnitOfWork uow) : IFranchiseService
{
    public async Task<PagedResult<FranchiseDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await franchises.GetPagedAsync(filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<FranchiseDto>(total, items.Select(ToDto));
    }

    public async Task<FranchiseDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var franchise = await franchises.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Franchise {id} not found.");
        return ToDto(franchise);
    }

    public async Task<FranchiseDto> CreateAsync(CreateFranchiseRequest request, CancellationToken ct = default)
    {
        var franchise = new Franchise { Name = request.Name, NameEn = request.NameEn };
        await franchises.AddAsync(franchise, ct);
        await uow.SaveChangesAsync(ct);
        return ToDto(franchise);
    }

    public async Task<FranchiseDto> UpdateAsync(Guid id, CreateFranchiseRequest request, CancellationToken ct = default)
    {
        var franchise = await franchises.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Franchise {id} not found.");
        franchise.Name = request.Name;
        franchise.NameEn = request.NameEn;
        franchises.Update(franchise);
        await uow.SaveChangesAsync(ct);
        return ToDto(franchise);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var franchise = await franchises.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Franchise {id} not found.");
        franchises.Delete(franchise);
        await uow.SaveChangesAsync(ct);
    }

    private static FranchiseDto ToDto(Franchise f) => new(f.Id, f.Name, f.NameEn, f.CreatedAt);
}
