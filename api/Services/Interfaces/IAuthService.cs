using System.Threading.Tasks;
using Api.Models.DTOs.Auth;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Defines authentication and authorization operations.  The
    /// implementation is responsible for verifying credentials,
    /// generating JWT/refresh tokens, refreshing tokens and
    /// invalidating sessions on logout.  Password hashing and
    /// verification should follow security best practices (e.g.,
    /// Argon2id【110133013481214†L193-L204】).
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Authenticate a user using the provided credentials.  On
        /// success returns a LoginResponse containing tokens and
        /// minimal user info.  On failure throws an exception or
        /// returns null depending on the implementation.
        /// </summary>
        Task<LoginResponse> LoginAsync(LoginRequest request);

        /// <summary>
        /// Refresh the access token using a valid refresh token.
        /// Returns a new access token and optionally a new refresh
        /// token.  The refresh token should be invalidated on use.
        /// </summary>
        Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);

        /// <summary>
        /// Invalidate the current user session.  Depending on the
        /// implementation this may revoke refresh tokens or update
        /// session state in a store.  The current user can be
        /// determined from the authentication context.
        /// </summary>
        Task LogoutAsync();
    }
}