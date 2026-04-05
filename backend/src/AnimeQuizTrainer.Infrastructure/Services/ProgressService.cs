using AnimeQuizTrainer.Application.DTOs.Progress;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class ProgressService(
    IProgressRepository progress,
    IUserRepository users) : IProgressService
{
    public async Task<UserProgressSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct);
        var all = (await progress.GetAllByUserAsync(userId, ct)).ToList();
        var currentPosition = user?.QuizPosition ?? 0;

        var availableNow = all.Count(p => p.NextShowPosition <= currentPosition);
        var neverReviewed = all.Count(p => p.ReviewCount == 0);

        return new UserProgressSummaryDto(all.Count, availableNow, neverReviewed);
    }

    public async Task<IEnumerable<OpeningProgressDto>> GetOpeningsProgressAsync(Guid userId, CancellationToken ct = default)
    {
        var all = await progress.GetAllByUserAsync(userId, ct);
        return all.Select(p => new OpeningProgressDto(
            OpeningService.ToDto(p.Opening),
            p.GapSize,
            p.EaseFactor,
            p.ReviewCount,
            p.NextShowPosition,
            IsNew: p.ReviewCount == 0));
    }
}
