using Microsoft.AspNetCore.Identity;
using Wise.Domain.Enums;

namespace Wise.Domain.Entities;
public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public int Level { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public UserRole Role { get; set; } = UserRole.User;

    public ICollection<LearningResult> LearningResults { get; set; } = new List<LearningResult>();
}