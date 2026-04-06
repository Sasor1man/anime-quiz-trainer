namespace AnimeQuizTrainer.Application.DTOs.Series;

public record SeriesDto(
    Guid Id,
    string Name,
    string? NameEn,
    Guid FranchiseId,
    string FranchiseName,
    DateTime CreatedAt
);
