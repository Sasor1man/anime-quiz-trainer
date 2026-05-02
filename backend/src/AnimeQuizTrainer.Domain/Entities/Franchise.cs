namespace AnimeQuizTrainer.Domain.Entities;

public class Franchise
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Anime> Animes { get; set; } = [];
}
