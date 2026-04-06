using System.ComponentModel.DataAnnotations;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Anime;

public record CreateAnimeRequest(
    [Required, MaxLength(256)] string Title,
    [MaxLength(256)] string? TitleEn,
    [Required] Guid FranchiseId,
    Guid? SeriesId,
    [Required] AnimeType Type,
    int? SeasonNumber,
    List<Guid>? TagIds
);
