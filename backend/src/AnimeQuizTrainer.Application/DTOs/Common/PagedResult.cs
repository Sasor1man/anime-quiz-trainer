namespace AnimeQuizTrainer.Application.DTOs.Common;

public record PagedResult<T>(int TotalCount, IEnumerable<T> Items);
