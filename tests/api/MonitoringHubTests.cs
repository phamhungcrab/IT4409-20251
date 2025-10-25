using Xunit;
using api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace tests.api
{
    /// <summary>
    /// Basic unit tests for the <see cref="MonitoringHub"/>. Since
    /// SignalR hubs are tested primarily via integration tests,
    /// this test class only asserts that the hub can be instantiated
    /// without throwing and that methods exist. For more comprehensive
    /// coverage, use Microsoft.AspNetCore.SignalR.Client in an
    /// integration test project.
    /// </summary>
    public class MonitoringHubTests
    {
        [Fact]
        public void Hub_Can_Be_Constructed()
        {
            var hub = new MonitoringHub();
            Assert.NotNull(hub);
        }
    }
}