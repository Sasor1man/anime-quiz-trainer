using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Quiz;

public record TestStartRequest(
    int Count = 10,
    List<Difficulty>? Difficulties = null,
    List<Guid>? TagIds = null,
    List<SongType>? SongTypes = null,
    StartFrom StartFrom = StartFrom.Beginning,
    int SegmentSeconds = 30
);
