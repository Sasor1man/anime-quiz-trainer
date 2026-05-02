namespace AnimeQuizTrainer.Domain.Entities;

public class Artist
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public List<Song> Songs { get; set; } = [];
}
