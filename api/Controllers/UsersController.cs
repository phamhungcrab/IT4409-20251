using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    /// <summary>
    /// Manages user accounts.  Only administrators should have access to
    /// create, update and delete users.  Instructors may have read access
    /// depending on your requirements.  All methods are currently stubbed.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        // private readonly IUserService _userService;
        // public UsersController(IUserService userService)
        // {
        //     _userService = userService;
        // }

        /// <summary>
        /// Get a list of all users.  Should be restricted to admins.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllUsers()
        {
            await Task.CompletedTask;
            return Ok(new List<object>()); // Replace with actual user DTO list
        }

        /// <summary>
        /// Get a single user by ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetUserById(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"GetUser {id} endpoint not implemented." });
        }

        /// <summary>
        /// Create a new user account.  Accepts user details in the body.  The
        /// password should be hashed by the service layer.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateUser([FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = "CreateUser endpoint not yet implemented." });
        }

        /// <summary>
        /// Update an existing user.  Only administrators can update users.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] object request)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"UpdateUser {id} endpoint not yet implemented." });
        }

        /// <summary>
        /// Delete a user.  Use soft delete where possible to preserve history.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await Task.CompletedTask;
            return Ok(new { message = $"DeleteUser {id} endpoint not yet implemented." });
        }
    }
}