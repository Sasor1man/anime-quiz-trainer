using System.ComponentModel.DataAnnotations;

namespace AnimeQuizTrainer.Application.DTOs.Series;

public record CreateSeriesRequest(
    [Required, MaxLength(256)] string Name,
    [MaxLength(256)] string? NameEn,
    [Required] Guid FranchiseId
);
