using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnimeQuizTrainer.Infrastructure.Data.Configurations;

public class AnimeEntryConfiguration : IEntityTypeConfiguration<AnimeEntry>
{
    public void Configure(EntityTypeBuilder<AnimeEntry> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(256);
        builder.Property(e => e.TitleEn).HasMaxLength(256);
        builder.Property(e => e.Type).IsRequired();
        builder.HasIndex(e => e.Title);

        builder.HasOne(e => e.Anime)
            .WithMany(a => a.AnimeEntries)
            .HasForeignKey(e => e.AnimeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
