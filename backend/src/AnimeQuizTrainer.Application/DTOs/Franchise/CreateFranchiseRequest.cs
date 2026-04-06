using System.ComponentModel.DataAnnotations;

namespace AnimeQuizTrainer.Application.DTOs.Franchise;

public record CreateFranchiseRequest(
    [Required, MaxLength(256)] string Name,
    [MaxLength(256)] string? NameEn
);
