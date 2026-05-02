using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Franchise;

namespace AnimeQuizTrainer.Application.Services;

public interface IFranchiseService
{
    Task<PagedResult<FranchiseDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default);
    Task<FranchiseDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<FranchiseDto> CreateAsync(CreateFranchiseRequest request, CancellationToken ct = default);
    Task<FranchiseDto> UpdateAsync(Guid id, CreateFranchiseRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
