using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnimeQuizTrainer.Infrastructure.Data.Configurations;

public class UserSongProgressConfiguration : IEntityTypeConfiguration<UserSongProgress>
{
    public void Configure(EntityTypeBuilder<UserSongProgress> builder)
    {
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => new { p.UserId, p.SongId }).IsUnique();

        builder.HasOne(p => p.User)
            .WithMany(u => u.SongProgresses)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Song)
            .WithMany(s => s.UserProgresses)
            .HasForeignKey(p => p.SongId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
