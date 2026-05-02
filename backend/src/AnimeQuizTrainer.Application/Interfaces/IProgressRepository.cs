using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Application.Interfaces;

public interface IProgressRepository
{
    Task<UserSongProgress?> GetAsync(Guid userId, Guid songId, CancellationToken ct = default);
    /// <summary>Returns progress records where NextShowPosition &lt;= currentPosition (cooldown expired).</summary>
    Task<IEnumerable<UserSongProgress>> GetAvailableAsync(Guid userId, long currentPosition, CancellationToken ct = default);
    Task<IEnumerable<UserSongProgress>> GetAllByUserAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(UserSongProgress progress, CancellationToken ct = default);
    void Update(UserSongProgress progress);
}
