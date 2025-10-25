using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Option"/> entity.
    /// </summary>
    public class OptionConfiguration : IEntityTypeConfiguration<Option>
    {
        public void Configure(EntityTypeBuilder<Option> builder)
        {
            builder.ToTable("Options");
            builder.HasKey(o => o.Id);
            builder.Property(o => o.Text)
                .IsRequired()
                .HasMaxLength(500);
            builder.Property(o => o.IsCorrect)
                .IsRequired();
            builder.Property(o => o.Order)
                .IsRequired();
            builder.HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}