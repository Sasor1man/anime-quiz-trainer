namespace AnimeQuizTrainer.Domain.Entities;

public class Series
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }

    public Guid FranchiseId { get; set; }
    public Franchise Franchise { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Anime> Animes { get; set; } = [];
}
