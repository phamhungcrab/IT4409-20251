using Api.Models.Entities;

namespace Api.Models.DTOs.User
{
    /// <summary>
    /// Response payload representing user data.  Does not include
    /// sensitive information such as password hash or tokens.  This
    /// DTO is used both for returning user details after login and
    /// for listing users in admin views.
    /// </summary>
    public class UserResponse
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public Role Role { get; set; }
;
    }
}