namespace Api.Helpers
{
    /// <summary>
    /// Simple password hashing helper.  In production this should
    /// implement a secure hashing algorithm such as Argon2id or
    /// BCrypt【110133013481214†L193-L204】.  For the purposes of this
    /// demonstration the password is compared directly, which is
    /// not secure.
    /// </summary>
    public class PasswordHasher
    {
        /// <summary>
        /// Hashes a plain text password.  Replace with a secure
        /// hashing algorithm in production.
        /// </summary>
        public string HashPassword(string password)
        {
            // TODO: Use Argon2id/Bcrypt with salt
            return password;
        }

        /// <summary>
        /// Verifies a plain text password against a stored hash.
        /// </summary>
        public bool VerifyPassword(string password, string storedHash)
        {
            return password == storedHash;
        }
    }
}