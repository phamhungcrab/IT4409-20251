using System;
using System.Threading.Tasks;
using Api.Models.DTOs.Auth;
using Api.Services.Interfaces;
using Api.Models.Entities;
using Api.Data;
using Api.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    /// <summary>
    /// Provides user authentication and token issuance.  This
    /// implementation relies on an injected database context and a
    /// password hashing helper.  For brevity, many details are
    /// omitted; in a real implementation you would verify
    /// credentials, generate JWTs using a signing key and return
    /// refresh tokens【110133013481214†L193-L204】.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly PasswordHasher _passwordHasher;
        // TODO: Inject a JWT token generator and refresh token store

        public AuthService(ApplicationDbContext dbContext, PasswordHasher passwordHasher)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
        }

        /// <inheritdoc />
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // Find the user by email.  Use case insensitive search.
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            // Verify hashed password.
            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            // TODO: Generate JWT access and refresh tokens.
            var response = new LoginResponse
            {
                AccessToken = "dummy-access-token",
                RefreshToken = "dummy-refresh-token",
                User = new Api.Models.DTOs.User.UserResponse
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role.ToString()
                }
            };
            return response;
        }

        /// <inheritdoc />
        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            // TODO: Validate and rotate refresh token.  For now return
            // a dummy response.
            await Task.CompletedTask;
            return new LoginResponse
            {
                AccessToken = "new-access-token",
                RefreshToken = "new-refresh-token",
                User = null
            };
        }

        /// <inheritdoc />
        public async Task LogoutAsync()
        {
            // TODO: Revoke the current refresh token and clear any
            // session state.  For demonstration simply complete.
            await Task.CompletedTask;
        }
    }
}