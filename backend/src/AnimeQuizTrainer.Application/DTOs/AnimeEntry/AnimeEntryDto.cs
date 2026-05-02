using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.AnimeEntry;

public record AnimeEntryDto(
    Guid Id,
    string Title,
    string? TitleEn,
    AnimeType Type,
    Guid AnimeId,
    string AnimeTitle,
    DateTime CreatedAt
);
