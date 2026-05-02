using System.ComponentModel.DataAnnotations;
using AnimeQuizTrainer.Domain.Enums;

namespace AnimeQuizTrainer.Application.DTOs.AnimeEntry;

public record UpdateAnimeEntryRequest(
    [Required, MaxLength(256)] string Title,
    [MaxLength(256)] string? TitleEn,
    [Required] AnimeType Type,
    [Required] Guid AnimeId
);
