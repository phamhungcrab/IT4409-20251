using System;
using Microsoft.EntityFrameworkCore;
using api.Data;

namespace tests.api.TestFixtures
{
    /// <summary>
    /// A helper factory for creating an in‑memory <see cref="ApplicationDbContext"/>
    /// during unit and integration tests. This uses the EF Core
    /// InMemory provider, which does not support relational constraints
    /// but allows quick setup and teardown of a context. For more
    /// realistic tests (e.g., enforcing foreign keys), consider using
    /// the SQLite provider in memory mode or test containers.
    /// </summary>
    public static class TestDbContextFactory
    {
        /// <summary>
        /// Creates a new <see cref="ApplicationDbContext"/> configured to
        /// use the in‑memory provider. Each context uses a unique
        /// database name to ensure isolation across tests.
        /// </summary>
        public static ApplicationDbContext Create()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
                .Options;
            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        /// <summary>
        /// Disposes and deletes the database for the supplied context.
        /// </summary>
        public static void Destroy(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted();
            context.Dispose();
        }
    }
}