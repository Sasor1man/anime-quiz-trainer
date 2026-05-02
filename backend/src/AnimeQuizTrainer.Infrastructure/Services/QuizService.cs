using AnimeQuizTrainer.Application.DTOs.Quiz;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class QuizService(
    ISongRepository songs,
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
            return new LearnNextResponse(SongService.ToDto(available.Song), IsNew: false, available.ReviewCount);
        }

        // 2. New songs (no progress record yet)
        var trackedIds = allProgress.Select(p => p.SongId).ToHashSet();
        var allSongs = await songs.GetAllAsync(ct);
        var newSong = allSongs.FirstOrDefault(s => !trackedIds.Contains(s.Id));

        if (newSong is not null)
        {
            user.QuizPosition++;
            users.Update(user);
            await uow.SaveChangesAsync(ct);
            return new LearnNextResponse(SongService.ToDto(newSong), IsNew: true, ReviewCount: 0);
        }

        // 3. Fallback: everything on cooldown — pick the soonest to become available
        var soonest = allProgress
            .OrderBy(p => p.NextShowPosition)
            .ThenBy(p => p.EaseFactor)
            .FirstOrDefault();

        if (soonest is null) return null; // no songs in the database at all

        user.QuizPosition++;
        users.Update(user);
        await uow.SaveChangesAsync(ct);
        return new LearnNextResponse(SongService.ToDto(soonest.Song), IsNew: false, soonest.ReviewCount);
    }

    public async Task<ReviewResponse> SubmitReviewAsync(Guid userId, ReviewRequest request, CancellationToken ct = default)
    {
        var record = await progress.GetAsync(userId, request.SongId, ct);

        if (record is null)
        {
            record = new UserSongProgress
            {
                UserId = userId,
                SongId = request.SongId
            };
            await progress.AddAsync(record, ct);
        }

        var user = await users.GetByIdAsync(userId, ct)
            ?? throw new InvalidOperationException("User not found.");

        int totalSongs = await songs.CountAsync(ct);
        ApplyReview(record, request.Quality, totalSongs);
        record.ReviewCount++;

        // NextShowPosition = current position + gap (the position increment for this review
        // has already happened in GetNext, so we use the current QuizPosition as baseline)
        record.NextShowPosition = user.QuizPosition + record.GapSize;

        progress.Update(record);
        await uow.SaveChangesAsync(ct);

        return new ReviewResponse(request.SongId, record.GapSize, record.NextShowPosition.Value);
    }

    public async Task<TestStartResponse> StartTestAsync(TestStartRequest request, CancellationToken ct = default)
    {
        var filtered = await songs.GetFilteredAsync(
            request.Difficulties,
            request.TagIds,
            request.SongTypes,
            request.Count,
            ct);

        var items = filtered.Select(s =>
        {
            var startAt = request.StartFrom switch
            {
                StartFrom.Chorus    => s.ChorusTiming,
                StartFrom.Beginning => s.StartTiming ?? 0,
                StartFrom.Random    => PickRandomStart(s),
                _                   => 0
            };
            return new TestSongItem(SongService.ToDto(s), startAt);
        }).ToList();

        return new TestStartResponse(items, request.StartFrom, request.SegmentSeconds);
    }

    // Position-based spaced repetition with EaseFactor
    // GapSize = how many other songs must be shown before this one reappears
    // Coefficients are relative to N (total songs in the database)
    private static void ApplyReview(UserSongProgress record, ReviewQuality quality, int N)
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

    private static double PickRandomStart(Song s)
    {
        var options = new List<double>();
        if (s.StartTiming.HasValue) options.Add(s.StartTiming.Value);
        options.Add(s.ChorusTiming);
        return options[Random.Shared.Next(options.Count)];
    }
}
