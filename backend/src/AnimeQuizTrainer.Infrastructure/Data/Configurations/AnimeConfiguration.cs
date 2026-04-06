using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnimeQuizTrainer.Infrastructure.Data.Configurations;

public class AnimeConfiguration : IEntityTypeConfiguration<Anime>
{
    public void Configure(EntityTypeBuilder<Anime> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Title).IsRequired().HasMaxLength(256);
        builder.Property(a => a.TitleEn).HasMaxLength(256);
        builder.Property(a => a.Type).IsRequired();
        builder.HasIndex(a => a.Title);

        builder.HasOne(a => a.Franchise)
            .WithMany(f => f.Animes)
            .HasForeignKey(a => a.FranchiseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Series)
            .WithMany(s => s.Animes)
            .HasForeignKey(a => a.SeriesId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
