using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using api.Controllers;
using api.Models.DTOs.Auth;

namespace tests.api
{
    /// <summary>
    /// Basic unit tests for <see cref="AuthController"/>.
    /// These tests are intentionally lightweight and
    /// demonstrate how to structure controller tests with xUnit.
    /// In a real project, use a mocking framework (e.g., Moq)
    /// to supply an IAuthService and verify interactions.
    /// </summary>
    public class AuthControllerTests
    {
        [Fact]
        public async Task Login_Returns_Ok_When_Credentials_Are_Valid()
        {
            // Arrange: stubbed controller with null service for now.
            var controller = new AuthController(null!);
            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "password123"
            };

            // Act: call the login endpoint. In reality this
            // should be replaced with a mocked service returning a token.
            var result = await controller.Login(request);

            // Assert: verify that an IActionResult is returned.
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        // Additional tests could cover failure cases, refresh token
        // handling and logout, once the underlying service is implemented.
    }
}