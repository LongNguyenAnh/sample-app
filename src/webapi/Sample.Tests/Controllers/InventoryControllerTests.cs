using AutoFixture;
using FluentAssertions;
using Sample.Constants;
using Sample.Controllers;
using Sample.Models;
using Sample.Workers;
using sampleSDK.LocationService.Models;
using sampleSDK.LocationService;
using sample.Researchable.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Net;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using sampleSDK.Inventory;
using sampleSDK.Inventory.Models;

namespace Sample.Tests.Controllers
{
    public class InventoryControllerTests
    {
        private readonly Fixture _fixture;

        private readonly Mock<IWebApiWorker> _webApiWorkerMock;
        private readonly InventoryController _inventoryController;


        public InventoryControllerTests()
        {
            _fixture = new Fixture();

            _webApiWorkerMock = new Mock<IWebApiWorker>();
            _sampleInventoryMock = new Mock<IsampleInventory>();
            
            _inventoryController = new InventoryController(_webApiWorkerMock.Object, _sampleInventoryMock.Object);
        }
        
        #region GetInventoryAsync

        [Fact]
        public async Task InventoryController_GetInventoryAsync_ShouldReturnCorrectly()
        {
            // arrange
            var mockInventory = _fixture.Create<object>();

            _webApiWorkerMock
                .Setup(m => m.GetInventoryAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(mockInventory);

            _inventoryController.ControllerContext = UnitTestHelper.createMockContext("/inventory");

            // act
            var actualResult = (ObjectResult)await _inventoryController.GetInventoryAsync(
                "abc");

            // assert
            actualResult.Value.Should().NotBeNull();
            actualResult.StatusCode.Should().Be((int)HttpStatusCode.OK, "InventoryController.GetInventoryAsync should return a 200 when reviews found.");
        }

        [Fact]
        public async Task InventoryController_GetInventoryAsync_ShouldReturnCorrectly_WhenProductIdSpecified()
        {
            // arrange
            var mockInventory = _fixture.Create<object>();

            _webApiWorkerMock
                .Setup(m => m.GetInventoryAsync(null, It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(mockInventory);

            _inventoryController.ControllerContext = UnitTestHelper.createMockContext("/inventory");

            // act
            var actualResult = (ObjectResult)await _inventoryController.GetInventoryAsync(
                null, 12345);

            // assert
            actualResult.Value.Should().NotBeNull();
            actualResult.StatusCode.Should().Be((int)HttpStatusCode.OK, "InventoryController.GetInventoryAsync should return a 200 when reviews found.");
        }
        #endregion
    }
}
