namespace AnimeQuizTrainer.Application.DTOs.Quiz;

public record ReviewResponse(
    Guid SongId,
    int NewGapSize,
    long NextShowPosition
);
