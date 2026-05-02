using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Domain.Entities;

public class AnimeEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? TitleEn { get; set; }

    public AnimeType Type { get; set; }

    public Guid AnimeId { get; set; }
    public Anime Anime { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Song> Songs { get; set; } = [];
}
