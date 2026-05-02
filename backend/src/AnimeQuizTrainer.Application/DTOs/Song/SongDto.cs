using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Song;

public record SongDto(
    Guid Id,
    Guid AnimeEntryId,
    string AnimeEntryTitle,
    Guid AnimeId,
    string AnimeTitle,
    ArtistDto Artist,
    string SongTitle,
    string YoutubeUrl,
    SongType Type,
    int OrderNumber,
    Difficulty Difficulty,
    double? StartTiming,
    double ChorusTiming,
    DateTime CreatedAt
);
