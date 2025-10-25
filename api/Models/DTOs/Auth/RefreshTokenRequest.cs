using System.ComponentModel.DataAnnotations;

namespace Api.Models.DTOs.Auth
{
    /// <summary>
    /// Request body for refreshing an access token.  Contains the
    /// previously issued refresh token.  A valid refresh token must
    /// be supplied in order to obtain a new access token.
    /// </summary>
    public class RefreshTokenRequest
    {
        /// <summary>
        /// The refresh token issued during login.  This field is
        /// required.
        /// </summary>
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}