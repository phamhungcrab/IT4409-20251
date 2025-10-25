using Api.Models.DTOs.User;

namespace Api.Models.DTOs.Auth
{
    /// <summary>
    /// Response returned after a successful login.  Includes the
    /// generated access token, optional refresh token and a minimal
    /// representation of the authenticated user.  Do not include
    /// sensitive fields such as PasswordHash.
    /// </summary>
    public class LoginResponse
    {
        /// <summary>
        /// The JWT or bearer access token used for subsequent API
        /// requests.  Typically expires within minutes.
        /// </summary>
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>
        /// Optional refresh token used to obtain a new access token
        /// without re-authentication.  This may be null if refresh
        /// tokens are not implemented.
        /// </summary>
        public string? RefreshToken { get; set; }
;
        /// <summary>
        /// Basic information about the authenticated user.  See
        /// <see cref="UserResponse"/> for details.
        /// </summary>
        public UserResponse User { get; set; } = new UserResponse();
    }
}