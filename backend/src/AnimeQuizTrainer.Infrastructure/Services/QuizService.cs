using AnimeQuizTrainer.Application.DTOs.Quiz;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class QuizService(
    IOpeningRepository openings,
    IProgressRepository progress,
    IUserRepository users,
    IUnitOfWork uow) : IQuizService
{
    public async Task<LearnNextResponse?> GetNextLearnAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct);
        if (user is null) return null;

        var allProgress = (await progress.GetAllByUserAsync(userId, ct)).ToList();
        var currentPosition = user.QuizPosition;

        // 1. Overdue: cooldown expired, hardest (lowest EaseFactor) first
        var available = allProgress
            .Where(p => p.NextShowPosition <= currentPosition)
            .MinBy(p => p.EaseFactor);

        if (available is not null)
        {
            user.QuizPosition++;
            users.Update(user);
            await uow.SaveChangesAsync(ct);
            return new LearnNextResponse(OpeningService.ToDto(available.Opening), IsNew: false, available.ReviewCount);
        }

        // 2. New openings (no progress record yet)
        var trackedIds = allProgress.Select(p => p.OpeningId).ToHashSet();
        var allOpenings = await openings.GetAllAsync(ct);
        var newOpening = allOpenings.FirstOrDefault(o => !trackedIds.Contains(o.Id));

        if (newOpening is not null)
        {
            user.QuizPosition++;
            users.Update(user);
            await uow.SaveChangesAsync(ct);
            return new LearnNextResponse(OpeningService.ToDto(newOpening), IsNew: true, ReviewCount: 0);
        }

        // 3. Fallback: everything on cooldown — pick the soonest to become available
        var soonest = allProgress
            .OrderBy(p => p.NextShowPosition)
            .ThenBy(p => p.EaseFactor)
            .FirstOrDefault();

        if (soonest is null) return null; // no openings in the database at all

        user.QuizPosition++;
        users.Update(user);
        await uow.SaveChangesAsync(ct);
        return new LearnNextResponse(OpeningService.ToDto(soonest.Opening), IsNew: false, soonest.ReviewCount);
    }

    public async Task<ReviewResponse> SubmitReviewAsync(Guid userId, ReviewRequest request, CancellationToken ct = default)
    {
        var record = await progress.GetAsync(userId, request.OpeningId, ct);

        if (record is null)
        {
            record = new UserOpeningProgress
            {
                UserId = userId,
                OpeningId = request.OpeningId
            };
            await progress.AddAsync(record, ct);
        }

        var user = await users.GetByIdAsync(userId, ct)
            ?? throw new InvalidOperationException("User not found.");

        int totalOpenings = await openings.CountAsync(ct);
        ApplyReview(record, request.Quality, totalOpenings);
        record.ReviewCount++;

        // NextShowPosition = current position + gap (the position increment for this review
        // has already happened in GetNext, so we use the current QuizPosition as baseline)
        record.NextShowPosition = user.QuizPosition + record.GapSize;

        progress.Update(record);
        await uow.SaveChangesAsync(ct);

        return new ReviewResponse(request.OpeningId, record.GapSize, record.NextShowPosition.Value);
    }

    public async Task<TestStartResponse> StartTestAsync(TestStartRequest request, CancellationToken ct = default)
    {
        var filtered = await openings.GetFilteredAsync(
            request.Difficulties,
            request.TagIds,
            request.Count,
            ct);

        var items = filtered.Select(o =>
        {
            var startAt = request.StartFrom switch
            {
                StartFrom.Chorus    => o.ChorusTiming,
                StartFrom.Beginning => o.StartTiming ?? 0,
                StartFrom.Random    => PickRandomStart(o),
                _                   => 0
            };
            return new TestOpeningItem(OpeningService.ToDto(o), startAt);
        }).ToList();

        return new TestStartResponse(items, request.StartFrom, request.SegmentSeconds);
    }

    // Position-based spaced repetition with EaseFactor
    // GapSize = how many other openings must be shown before this one reappears
    // Coefficients are relative to N (total openings in the database)
    private static void ApplyReview(UserOpeningProgress record, ReviewQuality quality, int N)
    {
        switch (quality)
        {
            case ReviewQuality.Forgot:
                // Reset: show again very soon, EaseFactor drops significantly
                record.GapSize = Math.Max(3, (int)(N * 0.05));
                record.EaseFactor = Math.Max(1.3, record.EaseFactor - 0.30);
                break;

            case ReviewQuality.Hard:
                // Show again soon, small EaseFactor penalty
                record.GapSize = Math.Max(5, (int)(N * 0.12 * record.EaseFactor));
                record.EaseFactor = Math.Max(1.3, record.EaseFactor - 0.15);
                break;

            case ReviewQuality.Medium:
                // Show again after a while, EaseFactor unchanged
                record.GapSize = Math.Max(10, (int)(N * 0.20 * record.EaseFactor));
                break;

            case ReviewQuality.Easy:
                // Push to the back, EaseFactor grows
                record.GapSize = Math.Max(20, (int)(N * 0.50 * record.EaseFactor));
                record.EaseFactor = Math.Min(4.0, record.EaseFactor + 0.10);
                break;
        }
    }

    private static double PickRandomStart(Opening o)
    {
        var options = new List<double>();
        if (o.StartTiming.HasValue) options.Add(o.StartTiming.Value);
        options.Add(o.ChorusTiming);
        return options[Random.Shared.Next(options.Count)];
    }
}
