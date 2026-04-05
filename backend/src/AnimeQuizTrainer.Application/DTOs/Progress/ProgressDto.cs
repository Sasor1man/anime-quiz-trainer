using AnimeQuizTrainer.Application.DTOs.Opening;

namespace AnimeQuizTrainer.Application.DTOs.Progress;

public record UserProgressSummaryDto(
    int TotalTracked,
    int AvailableNow,
    int NeverReviewed
);

public record OpeningProgressDto(
    OpeningDto Opening,
    int GapSize,
    double EaseFactor,
    int ReviewCount,
    long? NextShowPosition,
    bool IsNew
);
