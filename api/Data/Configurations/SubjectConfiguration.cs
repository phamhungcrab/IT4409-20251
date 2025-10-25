using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="Subject"/> entity.
    /// </summary>
    public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            builder.ToTable("Subjects");
            builder.HasKey(s => s.Id);
            builder.Property(s => s.SubjectCode)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(s => s.SubjectCode)
                .IsUnique();
            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(s => s.Description)
                .HasMaxLength(1000);
            // Relationships
            builder.HasMany(s => s.Classes)
                .WithOne(c => c.Subject)
                .HasForeignKey(c => c.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(s => s.Questions)
                .WithOne(q => q.Subject)
                .HasForeignKey(q => q.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}