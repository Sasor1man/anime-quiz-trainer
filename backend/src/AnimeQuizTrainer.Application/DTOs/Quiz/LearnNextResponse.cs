using AnimeQuizTrainer.Application.DTOs.Song;

namespace AnimeQuizTrainer.Application.DTOs.Quiz;

public record LearnNextResponse(
    SongDto Song,
    bool IsNew,
    int ReviewCount
);
