using Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations
{
    /// <summary>
    /// Configures the <see cref="AuditEvent"/> entity.  Audit
    /// events record sensitive actions for compliance and
    /// traceability.  Each event stores the actor, action, entity
    /// affected and contextual metadata.  Entries are append‑only
    /// and should not be deleted.
    /// </summary>
    public class AuditEventConfiguration : IEntityTypeConfiguration<AuditEvent>
    {
        public void Configure(EntityTypeBuilder<AuditEvent> builder)
        {
            builder.ToTable("AuditEvents");
            builder.HasKey(ae => ae.Id);
            builder.Property(ae => ae.Action)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(ae => ae.EntityType)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(ae => ae.EntityId)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(ae => ae.Payload)
                .HasColumnType("nvarchar(max)");
            builder.Property(ae => ae.IpAddress)
                .HasMaxLength(45);
            builder.Property(ae => ae.UserAgent)
                .HasMaxLength(512);
            builder.Property(ae => ae.CreatedAt)
                .HasColumnType("datetime2");
            // Relationship to actor is optional; if the user is
            // deleted we keep the audit event with a null actor.
            builder.HasOne(ae => ae.Actor)
                .WithMany(u => u.AuditEvents)
                .HasForeignKey(ae => ae.ActorId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}