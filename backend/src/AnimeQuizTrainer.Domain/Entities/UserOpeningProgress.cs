namespace AnimeQuizTrainer.Domain.Entities;

public class UserOpeningProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid OpeningId { get; set; }
    public Opening Opening { get; set; } = null!;

    /// <summary>Ease factor (SM-2 style), starts at 2.5. Decreases on hard/forgot, increases on easy.</summary>
    public double EaseFactor { get; set; } = 2.5;

    /// <summary>How many other openings must be shown before this one can appear again.</summary>
    public int GapSize { get; set; } = 5;

    /// <summary>User.QuizPosition value at which this opening becomes available again. Null = never reviewed yet.</summary>
    public long? NextShowPosition { get; set; }

    /// <summary>Total number of reviews performed.</summary>
    public int ReviewCount { get; set; }
}
