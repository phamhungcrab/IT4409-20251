using System.ComponentModel.DataAnnotations;
using Api.Models.Entities;

namespace Api.Models.DTOs.User
{
    /// <summary>
    /// Request body for creating a new user.  Administrators will
    /// supply an email, password, optional full name and the role
    /// assigned to the user.  The password should be hashed by
    /// the service layer before being persisted.
    /// </summary>
    public class CreateUserRequest
    {
        /// <summary>
        /// Email address of the new user.  Must be unique and
        /// properly formatted.
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Plain text password.  Minimum length enforced here; the
        /// business layer may impose stronger complexity rules.
        /// </summary>
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Optional full name.  Useful for teachers and admins.
        /// </summary>
        public string? FullName { get; set; }

        /// <summary>
        /// The role assigned to the user (Admin, Teacher or Student).
        /// </summary>
        [Required]
        public Role Role { get; set; }

    }
}