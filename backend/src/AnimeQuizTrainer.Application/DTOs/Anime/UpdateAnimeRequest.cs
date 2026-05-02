using System.ComponentModel.DataAnnotations;

namespace AnimeQuizTrainer.Application.DTOs.Anime;

public record UpdateAnimeRequest(
    [Required, MaxLength(256)] string Title,
    [MaxLength(256)] string? TitleEn,
    Guid? FranchiseId,
    List<Guid>? TagIds
);
