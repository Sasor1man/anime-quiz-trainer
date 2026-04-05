using AnimeQuizTrainer.Application.DTOs.Opening;

namespace AnimeQuizTrainer.Application.DTOs.Quiz;

public record LearnNextResponse(
    OpeningDto Opening,
    bool IsNew,
    int ReviewCount
);
