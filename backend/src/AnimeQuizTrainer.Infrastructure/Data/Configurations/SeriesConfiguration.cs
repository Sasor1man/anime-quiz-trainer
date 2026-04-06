using AnimeQuizTrainer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AnimeQuizTrainer.Infrastructure.Data.Configurations;

public class SeriesConfiguration : IEntityTypeConfiguration<Series>
{
    public void Configure(EntityTypeBuilder<Series> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(256);
        builder.Property(s => s.NameEn).HasMaxLength(256);

        builder.HasOne(s => s.Franchise)
            .WithMany(f => f.Series)
            .HasForeignKey(s => s.FranchiseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
