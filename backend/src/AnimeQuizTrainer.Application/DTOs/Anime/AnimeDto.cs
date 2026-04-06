using AnimeQuizTrainer.Application.DTOs.Tag;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Anime;

public record AnimeDto(
    Guid Id,
    string Title,
    string? TitleEn,
    AnimeType Type,
    int? SeasonNumber,
    Guid FranchiseId,
    string FranchiseName,
    Guid? SeriesId,
    string? SeriesName,
    DateTime CreatedAt,
    List<TagDto> Tags
);
