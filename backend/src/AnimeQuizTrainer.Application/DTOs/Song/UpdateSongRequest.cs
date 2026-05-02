using System.ComponentModel.DataAnnotations;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.Song;

public record UpdateSongRequest(
    [Required] Guid ArtistId,
    [Required, MaxLength(256)] string SongTitle,
    [Required, Url] string YoutubeUrl,
    SongType Type,
    [Range(1, 100)] int OrderNumber,
    Difficulty Difficulty,
    double? StartTiming,
    double ChorusTiming
);
