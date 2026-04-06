using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Domain.Entities;

public class Anime
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? TitleEn { get; set; }

    public Guid FranchiseId { get; set; }
    public Franchise Franchise { get; set; } = null!;

    public Guid? SeriesId { get; set; }
    public Series? Series { get; set; }

    public AnimeType Type { get; set; }
    public int? SeasonNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<AnimeTag> AnimeTags { get; set; } = [];
    public List<Opening> Openings { get; set; } = [];
}
