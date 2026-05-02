using AnimeQuizTrainer.Application.DTOs.Tag;

namespace AnimeQuizTrainer.Application.DTOs.Anime;

public record AnimeDto(
    Guid Id,
    string Title,
    string? TitleEn,
    Guid? FranchiseId,
    string? FranchiseName,
    DateTime CreatedAt,
    List<TagDto> Tags
);
