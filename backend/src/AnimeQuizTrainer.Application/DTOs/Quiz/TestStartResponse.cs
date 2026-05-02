using AnimeQuizTrainer.Application.DTOs.Song;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Quiz;

public record TestStartResponse(
    List<TestSongItem> Songs,
    StartFrom StartFrom,
    int SegmentSeconds
);

public record TestSongItem(
    SongDto Song,
    double StartAtSeconds
);
