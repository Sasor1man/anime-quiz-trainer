namespace AnimeQuizTrainer.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Monotonically increasing counter: +1 on every GetNextLearn call. Used as a position clock for cooldowns.</summary>
    public long QuizPosition { get; set; }

    public List<RefreshToken> RefreshTokens { get; set; } = [];
    public List<UserSongProgress> SongProgresses { get; set; } = [];
}
