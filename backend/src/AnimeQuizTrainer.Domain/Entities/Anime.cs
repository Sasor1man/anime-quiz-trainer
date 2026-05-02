namespace AnimeQuizTrainer.Domain.Entities;

public class Anime
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? TitleEn { get; set; }

    public Guid? FranchiseId { get; set; }
    public Franchise? Franchise { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<AnimeTag> AnimeTags { get; set; } = [];
    public List<AnimeEntry> AnimeEntries { get; set; } = [];
}
