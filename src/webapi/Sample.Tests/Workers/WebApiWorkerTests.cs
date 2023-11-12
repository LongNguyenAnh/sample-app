using AutoFixture;
using FluentAssertions;
using sample.RoutingService;
using sample.WebRequest.Models;
using Sample.Constants;
using Sample.Models;
using Sample.Workers;
using Microsoft.Extensions.Configuration;
using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Sample.Tests.Workers
{
    [Collection("test collection")]
    public class WebApiWorkerTests
    {
        private readonly Fixture _fixture;

        private readonly WebApiWorker _webApiWorker;
        private readonly Mock<IProductSelectionWorker> _productSelectionWorkerMock;
        private readonly Mock<IInventoryWorker> _inventoryWorkerMock;

        public WebApiWorkerTests()
        {
            _fixture = new Fixture();
            _fixture.Register<System.Net.Http.Headers.HttpResponseHeaders>(() => null);

            _productSelectionWorkerMock = new Mock<IProductSelectionWorker>();
            _inventoryWorkerMock = new Mock<IInventoryWorker>();            

            _webApiWorker = new WebApiWorker(_productSelectionWorkerMock.Object, _inventoryWorkerMock.Object);
        }

        #region GetInventoryAsync
        [Fact]
        public async Task WebApiWorker_GetInventoryResultsAsync_ShouldReturnListingsWhenName()
        {
            //arrange
            _fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList().ForEach(b => _fixture.Behaviors.Remove(b));
            _fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            var mockProduct = _fixture.Build<Product>().With(x => x.ProductClass, ProductClass.Used).Create();
            var mockUrl = _fixture.Create<string>();

            var mockInventoryResults = _fixture.Build<ResponseDTO<ListingDTO>>()
                .With(x => x.WebResponse, _fixture.Build<sampleWebResponse>()
                    .With(x => x.ErrorMessage, string.Empty)
                    .Create())
                .Create();
            var mockZipcodeModel = _fixture.Build<ZipCode>()
                .With(x => x.Latitude, "10")
                .With(x => x.Longitude, "10")
                .Create();

            _productSelectionWorkerMock
                .Setup(x => x.GetDefaultProductAsync(It.IsAny<int>()))
                .ReturnsAsync(mockProduct);
            _inventoryWorkerMock
                .Setup(x => x.GetInventoryAsync(It.IsAny<List<string>>(), It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(mockInventoryResults);

            //act
            var listings = await _webApiWorker.GetInventoryAsync("abc");

            //assert
            listings.Should().NotBeNull();
        }

                [Fact]
        public async Task WebApiWorker_GetInventoryResultsAsync_ShouldReturnListingsWhenProductId()
        {
            //arrange
            _fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList().ForEach(b => _fixture.Behaviors.Remove(b));
            _fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            var mockProduct = _fixture.Build<Product>().With(x => x.ProductClass, ProductClass.Used).Create();
            var mockUrl = _fixture.Create<string>();

            var mockAtcMakeMapping = _fixture.Create<AtcMakeModelTrim>();
            var mockInventoryResults = _fixture.Build<ResponseDTO<ListingDTO>>()
                .With(x => x.WebResponse, _fixture.Build<sampleWebResponse>()
                    .With(x => x.ErrorMessage, string.Empty)
                    .Create())
                .Create();
            _productSelectionWorkerMock
                .Setup(x => x.GetDefaultProductAsync(It.IsAny<int>()))
                .ReturnsAsync(mockProduct);
            
            _inventoryWorkerMock
                .Setup(x => x.GetInventoryAsync(It.IsAny<List<string>>(), It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(mockInventoryResults);

            //act
            var listings = await _webApiWorker.GetInventoryAsync("abc", 12345, string.Empty);

            //assert
            listings.Should().NotBeNull();
        }

        #endregion

    }
}
