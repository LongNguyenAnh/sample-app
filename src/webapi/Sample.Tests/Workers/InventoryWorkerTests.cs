using AutoFixture;
using FluentAssertions;
using sampleSDK.FlipperService;
using sample.RoutingService;
using sample.WebRequest.Models;
using Sample.Constants;
using Sample.Models;
using Sample.Workers;
using sample.WebRequest;
using sampleSDK.GearboxService;
using sampleSDK.GearboxService.Common.DTO.ProductInventory;
using sampleSDK.GearboxService.Constants.ProductInventory;
using sampleSDK.Inventory;
using sampleSDK.Inventory.Models;
using sample.Researchable.Shared.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Moq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace Sample.Tests.Workers
{
    [Collection("test collection")]
    public class InventoryWorkerTests
    {
        private readonly Fixture _fixture;

        private readonly InventoryWorker _inventoryWorker;
        private readonly Mock<ISampleProductInventoryWorker> _productInventoryWorkerMock;

        public InventoryWorkerTests()
        {
            _fixture = new Fixture();
            _fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList().ForEach(b => _fixture.Behaviors.Remove(b));
            _fixture.Behaviors.Add(new OmitOnRecursionBehavior());
            _fixture.Register<System.Net.Http.Headers.HttpResponseHeaders>(() => null);

            _productInventoryWorkerMock = new Mock<IsampleProductInventoryWorker>();

            _inventoryWorker = new InventoryWorker(_productInventoryWorkerMock.Object, _sampleRouterMock.Object, _sampleFlipperMock.Object);
        }

        #region GetInventoryAsync

        [Fact]
        public async Task InventoryWorker_GetInventoryAsync_ShouldGetResults()
        {
            //arrange
            const int minResultsForExpansion = 10;
            const int defaultRadius = 75;

            var mockInventoryResults = _fixture.Build<ResponseDTO<ListingDTO>>()
                .With(x => x.MetaData, _fixture.Build<MetaDataDTO>()
                    .With(x => x.TotalResults, minResultsForExpansion)
                    .Create())
                .With(x => x.WebResponse, _fixture.Build<sampleWebResponse>()
                    .With(x => x.ErrorMessage, string.Empty)
                    .Create())
                .Create();

            _productInventoryWorkerMock
                .Setup(x => x.GetListingsAsync(It.Is<SearchCriteriaDTO>(sc => sc.Year == 2020 && sc.Distance == defaultRadius), It.IsAny<decimal>()))
                .ReturnsAsync(mockInventoryResults);

            //act
            ResponseDTO<ListingDTO> inventoryResults = await _inventoryWorker.GetInventoryAsync(2020);

            //assert
            inventoryResults.Should().NotBeNull();
            inventoryResults.Should().BeEquivalentTo(mockInventoryResults);

            _productInventoryWorkerMock
                .Verify(x => x.GetListingsAsync(It.IsAny<SearchCriteriaDTO>(), It.IsAny<decimal>()), Times.Once);
        }

        #endregion
    }
}