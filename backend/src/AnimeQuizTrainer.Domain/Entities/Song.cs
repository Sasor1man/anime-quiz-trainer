using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Domain.Entities;

public class Song
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid AnimeEntryId { get; set; }
    public AnimeEntry AnimeEntry { get; set; } = null!;

    public Guid ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;

    public string SongTitle { get; set; } = string.Empty;
    public string YoutubeUrl { get; set; } = string.Empty;

    public SongType Type { get; set; }

    /// <summary>Number within the same type for this entry (e.g. OP1, ED2, ...).</summary>
    public int OrderNumber { get; set; }

    public Difficulty Difficulty { get; set; }

    /// <summary>Custom start time in seconds. Null means use YouTube default.</summary>
    public double? StartTiming { get; set; }

    /// <summary>Chorus start time in seconds.</summary>
    public double ChorusTiming { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<UserSongProgress> UserProgresses { get; set; } = [];
}
