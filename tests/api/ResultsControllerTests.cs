using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using api.Controllers;

namespace tests.api
{
    /// <summary>
    /// Unit tests for <see cref="ResultsController"/>. These tests
    /// validate that endpoints return the correct IActionResult types.
    /// Integration tests should be added once services and data
    /// context are available.
    /// </summary>
    public class ResultsControllerTests
    {
        [Fact]
        public async Task GetMyResults_Returns_Ok()
        {
            var controller = new ResultsController(null!, null!);
            var result = await controller.GetMyResults();
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetExamResults_Returns_Ok()
        {
            var controller = new ResultsController(null!, null!);
            var result = await controller.GetExamResults(1);
            Assert.IsType<OkObjectResult>(result);
        }
    }
}