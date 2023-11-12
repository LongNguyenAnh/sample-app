using FluentAssertions;
using Sample.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Sample.Tests.Controllers
{
    public class HealthcheckControllerTests
    {
        [Fact]
        public void HealthcheckController_Get_Should_ReturnOkResult()
        {
            // Arrange
            var controller = new HealthcheckController();

            // Act
            var result = controller.Get();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        }
    }
}
