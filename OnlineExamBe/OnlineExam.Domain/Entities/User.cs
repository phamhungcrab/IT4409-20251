using OnlineExam.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineExam.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required DateTime DateOfBirth { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required UserRole Role { get; set; }

        // Navigation properties
        public ICollection<Class> TaughtClasses { get; set; }
        public ICollection<StudentClass> StudentClasses { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
