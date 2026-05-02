namespace AnimeQuizTrainer.Application.DTOs.Franchise;

public record FranchiseDto(
    Guid Id,
    string Name,
    string? NameEn,
    DateTime CreatedAt
);
