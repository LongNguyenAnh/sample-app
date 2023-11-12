using AutoMapper;
using sampleSDK.LocationService.Models;
using sample.RoutingService;
using Sample.Constants;
using Sample.Extensions;
using Sample.Helpers;
using Sample.Models;
using sampleSDK.GearboxService.Common.DTO.ProductInventory;
using sampleSDK.GearboxService.Constants.ProductInventory;
using sampleSDK.LocationService;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using sample.Researchable.Shared.Models;
using sampleSDK.LocationService.Helpers;

namespace Sample.Workers
{
    public class WebApiWorker : IWebApiWorker
    {
        private readonly IConfiguration _configuration;
        private readonly IVrsApiWorker _vrsApiWorker;
        private readonly IProductSelectionWorker _productSelectionWorker;
        private readonly IsampleRouter _sampleRouter;
        private readonly IInventoryWorker _inventoryWorker;        
        private readonly IsampleLocation _sampleLocation;
        private readonly IProductRecommendationWorker _productRecommendationWorker;

        public WebApiWorker(IConfiguration configuration, IVrsApiWorker vrsApiWorker, IS3ClientWorker s3ClientWorker,
            IProductSelectionWorker productSelectionWorker, IsampleRouter sampleRouter, ITaxesAndFeesWorker taxesAndFeesWorker,
            IInventoryWorker inventoryWorker, IsampleLocation sampleLocation,
            IProductRecommendationWorker productRecommendationWorker)
        {
            _configuration = configuration;
            _productSelectionWorker = productSelectionWorker;
            _sampleRouter = sampleRouter;
            _inventoryWorker = inventoryWorker;
            _productRecommendationWorker = productRecommendationWorker;
        }

        #region CrossShopping
        public async Task<Recommendation> GetCrossShoppingProductsAsync(int chromeStyleId, string intent, int numResults)
        {
            string productType = intent.Equals(IntentType.BuyNew) ? "NEW" : "USED";
            Models.External.RecommendationResponse crossShoppingResults = await _productRecommendationWorker.GetCrossShoppingProductsAsync(chromeStyleId, productType, numResults + 5);

            if (crossShoppingResults == null || crossShoppingResults.Products == null || !crossShoppingResults.Products.Any())
            {
                return null;
            }

            var recommendedProducts = crossShoppingResults.Products
                .Select(x => new RecommendedProduct { ChromeStyleIds = x.ChromeStyleIds })
                .ToList();

            var uniqueRecId = crossShoppingResults.AnalyticsProducts?.UniqueRecId;

            return new Recommendation
            {
                Products = recommendedProducts,
                UniqueRecId = uniqueRecId
            };
        }
        #endregion

        #region Inventory
        public async Task<object> GetInventoryAsync(string name, int? productId = null, string priceType = null)
        {
            Product defaultProduct;

            if (productId.HasValue && productId > 0)
            { //for samplet page
                defaultProduct = await _productSelectionWorker.GetDefaultProductAsync(productId.GetValueOrDefault());
            }
            else
            { // for overview cta on sample page
                defaultProduct = await _productSelectionWorker.GetDefaultProductAsync(name, productId);
            }

            if (defaultProduct == null)
            {
                return null;
            }

            // determine search types to pass
            List<string> searchTypes = new List<string>();
            if (defaultProduct.ProductClass.Equals(ProductClass.New, StringComparison.OrdinalIgnoreCase))
            {
                searchTypes.Add(ProductInventory.SearchType.New);
            }
            else if (defaultProduct.Year < DateTime.Now.Year - 1)
            {
                string searchType = string.Equals(priceType, PriceType.Cpo, StringComparison.OrdinalIgnoreCase)
                    ? ProductInventory.SearchType.Certified
                    : ProductInventory.SearchType.Used;

                searchTypes.Add(searchType);
            }

            ResponseDTO<ListingDTO> inventoryResults = await _inventoryWorker.GetInventoryAsync(defaultProduct.Year);

            if (!inventoryResults.WebResponse.Success)
            {
                inventoryResults.WebResponse.LogWebResponse();
                return null;
            }

            if (inventoryResults?.Results == null || !inventoryResults.Results.Any())
            {
                return null;
            }

            // update distance for each listing
            ZipCode zipCodeModel = await _sampleLocation.GetZipCodeAsync(zipCode);
            inventoryResults.Results.ForEach(x =>
            {
                if (x.Owner != null)
                {
                    x.Owner.Distance = (int?)ZipCodeHelper.DetermineDistance(zipCodeModel, x.Owner.Latitude, x.Owner.Longitude);
                }
            });

            int index = 0;

            var results = inventoryResults.Results.Select(x => new
            {
                x.Year,
                x.Price,
                ListingId = x.Id,
                image = x.GetImages(InventoryImageSizes.S256x189)?.FirstOrDefault(),
                DetailsLink = GetUrl("trident", "sample.Trident.Web.Areas.Classifieds_ProductDetail", GetInventoryParameters(inventoryResults, defaultProduct, x, index)),
                InventoryParameters = GetInventoryParametersQueryString(inventoryResults, defaultProduct, x, index++),
                x.ProductStatus,
                StockId = x.StockNumber
            });

            results = results?.OrderByDescending(x => x.DealIndicator).ThenBy(x => x.Price);

            // determine listing type
            string listingType = inventoryResults?.SearchCriteria?.SearchTypes == null ? "all" : GetListingType(defaultProduct.GetIntent(), defaultProduct.Year, priceType);
            object inventoryParameters = GetInventoryParameters(defaultProduct, listingType, defaultProduct.Year, zipCodeModel);
            var response = new
            {
                TotalResults = inventoryResults.MetaData.TotalResultCount,
                BrowseMoreNoLocationLink = GetUrl("classifieds", "sample-searchtype", inventoryParameters),
                BrowseMoreLink = GetUrl("classifieds", "sample-searchtype-geo", inventoryParameters),
                Results = results
            };

            return response;
        }

        private string GetUrl(string microservice, string routeName, object parameters = null)
        {
            string qs = _sampleRouter.GetUrl(microservice, routeName, parameters);

            // Remove trailing slash
            qs = qs.Replace("/?", "?");

            // Replace spaces with dashes
            qs = qs.Replace(" ", "-").ToLower();

            int position = qs.IndexOf("?");

            return position != -1 ? qs.Substring(0, position) : null;
        }

        public string GetInventoryParametersQueryString(ResponseDTO<ListingDTO> inventory, Product defaultProduct, ListingDTO listing = null, int? index = null, bool browseMoreLink = false, bool withAdditionalParams = false)
        {
            var apiParams = new Dictionary<string, object>()
            {
                {"distance", inventory.SearchCriteria?.Distance != null ? ((inventory.SearchCriteria.Distance == ProductInventory.NationalRadius) ? "none" : inventory.SearchCriteria?.Distance.ToString()) : null}
            };

            if (!browseMoreLink)
            {
                var additionalParams = new Dictionary<string, object>()
                {
                    {"year", inventory.SearchCriteria?.Year != null ? inventory.SearchCriteria.Year.ToString() : inventory.SearchCriteria?.StartYear != null && inventory.SearchCriteria?.EndYear != null ? $"{inventory.SearchCriteria.StartYear}-{inventory.SearchCriteria.EndYear}" : null},
                    {"searchtype", inventory.SearchCriteria?.SearchTypes != null ? string.Join("|", inventory.SearchCriteria.SearchTypes) : null},
                    {"name", defaultProduct.Name},
                    {"productId", defaultProduct.ProductId},
                    {"totalresults", listing != null ? inventory.MetaData.TotalResults.ToString() : null},
                    {"index", index}
                };
                apiParams = apiParams.Concat(additionalParams).ToDictionary(x => x.Key, x => x.Value);
            }

            if (withAdditionalParams)
            {
                var additionalParams = new Dictionary<string, object>()
                {
                    {"year", inventory.SearchCriteria?.Year != null ? inventory.SearchCriteria.Year.ToString() : null},
                    {"startYear", inventory.SearchCriteria?.StartYear != null ? inventory.SearchCriteria.StartYear.ToString() : null},
                    {"endYear", inventory.SearchCriteria?.EndYear != null ? inventory.SearchCriteria.EndYear.ToString() : null},
                    {"listingTypes", inventory.SearchCriteria?.SearchTypes?.Count > 0 ? string.Join(",", inventory.SearchCriteria.SearchTypes) : null}
                };
                additionalParams = additionalParams.Where(x => x.Value != null).ToDictionary(x => x.Key, x => x.Value);

                apiParams = apiParams.Concat(additionalParams).ToDictionary(x => x.Key, x => x.Value);
            }

            return string.Concat("?", apiParams.AsQueryString());
        }

        public object GetInventoryParameters(ResponseDTO<ListingDTO> inventory, Product defaultProduct, ListingDTO listing = null, int? index = null)
        {
            return new
            {
                searchtype = inventory.SearchCriteria?.SearchTypes != null ? string.Join("|", inventory.SearchCriteria.SearchTypes) : null,
                name = defaultProduct.Name,
                productId = defaultProduct.ProductId,
                year = inventory.SearchCriteria?.Year != null ? inventory.SearchCriteria.Year.ToString() : inventory.SearchCriteria?.StartYear != null && inventory.SearchCriteria?.EndYear != null ? $"{inventory.SearchCriteria.StartYear}-{inventory.SearchCriteria.EndYear}" : null,
                totalresults = listing != null ? inventory.MetaData.TotalResults.ToString() : null,
                index
            };
        }

        private string GetListingType(string intent, int year, string priceType)
        {
            string listingType = null;
            if (intent.Equals(IntentType.BuyNew, StringComparison.OrdinalIgnoreCase))
            {
                listingType = ProductInventory.SearchType.New;
            }
            else if (year < DateTime.Now.Year - 1)
            {
                listingType = string.Equals(priceType, PriceType.Cpo, StringComparison.OrdinalIgnoreCase)
                    ? ProductInventory.SearchType.Certified
                    : ProductInventory.SearchType.Used;
            }
            return listingType;
        }

        public object GetInventoryParameters(Product defaultProduct, int distance, string listingType, int year, ZipCode zipCode, string bodyStyleUrl = null, string fuelType = null)
        {
            if (year > DateTime.Now.Year - 1)
            {
                return new
                {
                    searchtype = listingType,
                    name = defaultProduct.Name
                };
            }
            else
            {
                return new
                {
                    searchtype = listingType,
                    name = defaultProduct.Name,
                    year
                };
            }
        }
        #endregion

        private string StaticDataS3Bucket => _configuration.GetValue<string>(ConfigurationKeys.StaticData.S3Bucket);
        private int StaticDataCacheExpirationTimeSpan => _configuration.GetValue<int>(ConfigurationKeys.StaticData.CacheExpirationTimeSpan);
    }

}
