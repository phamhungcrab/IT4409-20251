using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using api.Controllers;
using api.Models.DTOs.Exam;

namespace tests.api
{
    /// <summary>
    /// Tests for the <see cref="ExamsController"/>. These focus on
    /// verifying that actions return expected status codes and
    /// handle empty or invalid input gracefully. Replace the
    /// null constructor arguments with mocks when available.
    /// </summary>
    public class ExamsControllerTests
    {
        [Fact]
        public async Task CreateExam_Returns_BadRequest_For_Null_Request()
        {
            var controller = new ExamsController(null!, null!, null!, null!);
            CreateExamRequest? request = null;
            var result = await controller.CreateExam(request!);
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task GetAllExams_Returns_Ok()
        {
            var controller = new ExamsController(null!, null!, null!, null!);
            var result = await controller.GetAllExams();
            Assert.IsType<OkObjectResult>(result);
        }
    }
}