using System.ComponentModel.DataAnnotations;

namespace AnimeQuizTrainer.Application.DTOs.Anime;

public record CreateAnimeRequest(
    [Required, MaxLength(256)] string Title,
    [MaxLength(256)] string? TitleEn,
    Guid? FranchiseId,
    List<Guid>? TagIds
);
