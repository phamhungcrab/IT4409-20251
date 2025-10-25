using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Question"/> entity.
    /// </summary>
    public class QuestionConfiguration : IEntityTypeConfiguration<Question>
    {
        public void Configure(EntityTypeBuilder<Question> builder)
        {
            builder.ToTable("Questions");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.Text)
                .IsRequired()
                .HasMaxLength(1000);
            builder.Property(q => q.Type)
                .IsRequired()
                .HasMaxLength(30);
            builder.Property(q => q.Explanation)
                .HasMaxLength(1000);
            builder.HasOne(q => q.Subject)
                .WithMany(s => s.Questions)
                .HasForeignKey(q => q.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(q => q.Options)
                .WithOne(o => o.Question)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(q => q.QuestionExams)
                .WithOne(qe => qe.Question)
                .HasForeignKey(qe => qe.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}