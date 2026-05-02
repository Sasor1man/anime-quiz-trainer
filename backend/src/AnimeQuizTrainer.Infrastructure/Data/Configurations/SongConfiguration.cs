using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnimeQuizTrainer.Infrastructure.Data.Configurations;

public class SongConfiguration : IEntityTypeConfiguration<Song>
{
    public void Configure(EntityTypeBuilder<Song> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.SongTitle).IsRequired().HasMaxLength(256);
        builder.Property(s => s.YoutubeUrl).IsRequired().HasMaxLength(512);
        builder.Property(s => s.Type).HasConversion<string>();
        builder.Property(s => s.Difficulty).HasConversion<string>();

        builder.HasOne(s => s.AnimeEntry)
            .WithMany(e => e.Songs)
            .HasForeignKey(s => s.AnimeEntryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Artist)
            .WithMany(a => a.Songs)
            .HasForeignKey(s => s.ArtistId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => new { s.AnimeEntryId, s.Type, s.OrderNumber }).IsUnique();
    }
}
