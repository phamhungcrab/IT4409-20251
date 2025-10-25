using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.Auth
{
    /// <summary>
    /// Request body for user login.  Contains the credentials used
    /// to authenticate a user.  Both fields are required and will
    /// be validated by the controller or model binder.
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// The user’s email address.  This field must be a valid
        /// email format.
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// The user’s plain text password.  It should be at least
        /// six characters long; server side validation will enforce
        /// stronger requirements if necessary.
        /// </summary>
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}