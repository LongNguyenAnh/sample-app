using AutoMapper;
using sampleSDK.FlipperService;
using sample.RoutingService;
using Sample.Constants;
using Sample.Extensions;
using Sample.Helpers;
using Sample.Models;
using sample.WebRequest;
using sample.WebRequest.Models;
using sampleSDK.GearboxService;
using sampleSDK.GearboxService.Common.DTO.ProductInventory;
using sampleSDK.GearboxService.Constants.ProductInventory;
using sampleSDK.Inventory.Models;
using sampleSDK.Inventory;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Linq;
using System.Threading.Tasks;
using DataMapping = sampleSDK.GearboxService.Common.Helpers.ProductInventoryHelper.DataMapping;
using ReturnData = sampleSDK.GearboxService.Common.DTO.ProductInventory.ReturnData;
using sample.Researchable.Shared.Models;

namespace Sample.Workers
{
    public class InventoryWorker : IInventoryWorker
    {
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private readonly IsampleProductInventoryWorker _productInventoryWorker;
        private readonly IsampleRouter _sampleRouter;
        private readonly IsampleFlipper _sampleFlipper;
        private readonly IsampleInventory _sampleInventory;
        private readonly IsampleWebRequest _sampleWebRequest;

        private int LscApiTimeOutSeconds => _configuration.GetValue<int>("ApiTimeOutSeconds");
        private string LscEndpointBaseUrl => _configuration.GetValue<string>("ApiBaseUrl");
        private bool _logAllWebResponses => _configuration.GetValue<bool>("LogAllWebResponses");
        private int _defaultRetryLimit => _configuration.GetValue<int>("ApiRetryLimit");
        private int _defaultRetryTimeoutGain => _configuration.GetValue<int>("ApiRetryTimeoutGainSeconds");

        public InventoryWorker(IConfiguration configuration, IMemoryCache memoryCache, IsampleProductInventoryWorker productInventoryWorker, IsampleRouter sampleRouter, IsampleFlipper sampleFlipper,
            IsampleInventory sampleInventory, IsampleWebRequest sampleWebRequest)
        {
            _configuration = configuration;
            _cache = memoryCache;
            _productInventoryWorker = productInventoryWorker;
            _sampleRouter = sampleRouter;
            _sampleFlipper = sampleFlipper;
            _sampleInventory = sampleInventory;
            _sampleWebRequest = sampleWebRequest;
        }

        public async Task<ResponseDTO<ListingDTO>> GetInventoryAsync(int yearId)
        {
            var searchCriteria = new SearchCriteriaDTO(true)
            {
                ActionOrigin = "sample|GetInventoryAsync",
                NumberOfRecords = numRecords,
                SearchTypes = searchTypes,
                Year = yearId,
                SortTypes = new List<string> { SortTypeValues.sampleRank }
            };

            ResponseDTO<ListingDTO> listingResponse = await GetListingsAsync(searchCriteria);
            if (listingResponse?.MetaData != null && listingResponse.MetaData.TotalResults >= minResultsForExpansion)
            {
                return listingResponse;
            }

            // if less than {minResultsForExpansion} results, then expand years
            int beginYear = yearId - 2;
            int endYear = yearId + 2;

            searchCriteria.Year = null;
            searchCriteria.SearchTypes = null;
            searchCriteria.StartYear = beginYear.ToString();
            searchCriteria.EndYear = endYear.ToString();

            listingResponse = await GetListingsAsync(searchCriteria);

            if ((listingResponse?.MetaData != null && listingResponse.MetaData.TotalResults >= minResultsForExpansion) ||
                defaultRadius == ProductInventory.NationalRadius)
            {
                return listingResponse;
            }

            // if less than {minResultsForExpansion} results, expand radius to 200, and search again (unless the default radius is already at the national value)
            searchCriteria.Distance = 200;
            listingResponse = await GetListingsAsync(searchCriteria);
            if (listingResponse?.MetaData != null && listingResponse.MetaData.TotalResults >= minResultsForExpansion)
            {
                return listingResponse;
            }

            // if less than {minResultsForExpansion} results, expand radius to 500, and search again
            searchCriteria.Distance = 500;
            listingResponse = await GetListingsAsync(searchCriteria);
            if (listingResponse?.MetaData != null && listingResponse.MetaData.TotalResults >= minResultsForExpansion)
            {
                return listingResponse;
            }

            // if less than {minResultsForExpansion} results, expand radius to nationwide, and search again
            searchCriteria.Distance = ProductInventory.NationalRadius;
            return await GetListingsAsync(searchCriteria);
        }

        public async Task<ResponseDTO<ListingDTO>> GetListingsAsync(SearchCriteriaDTO searchCriteria, bool cacheResponse = false)
        {
            string cacheKey = $"GetListingsAsync|{searchCriteria.CacheKey}";
            if (!cacheResponse || !_cache.TryGetValue(cacheKey, out ResponseDTO<ListingDTO> response) || response == null)
            {
                response = await _productInventoryWorker.GetListingsAsync(searchCriteria);
                if (response != null && cacheResponse)
                {
                    _cache.Set(cacheKey, response, TimeSpan.FromSeconds(3600));
                }
            }

            return response;
        }

        private async Task<bool> IsFeatureEnabledAsync(string flipperKey)
        {
            bool active = false;
            try
            {
                active = await _sampleFlipper.IsFeatureEnabledAsync(flipperKey);
            }
            catch (Exception e)
            {
                Console.WriteLine($"ERROR: Flipper {flipperKey} could not be retrieved: {e}");
            }
            return active;
        }
    }
}
