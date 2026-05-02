using AnimeQuizTrainer.Application.DTOs.Song;

namespace AnimeQuizTrainer.Application.DTOs.Progress;

public record UserProgressSummaryDto(
    int TotalTracked,
    int AvailableNow,
    int NeverReviewed
);

public record SongProgressDto(
    SongDto Song,
    int GapSize,
    double EaseFactor,
    int ReviewCount,
    long? NextShowPosition,
    bool IsNew
);
