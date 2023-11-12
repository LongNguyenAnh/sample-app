using Sample.WebRequest;
using Sample.WebRequest.Models;
using Sample.Extensions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace Sample.Sample.Workers
{
    public class ProductRecommendationWorker : IProductRecommendationWorker
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ProductRecommendationWorker> _logger;
        private readonly ISampleWebRequest _sampleWebRequest;
        private readonly IMemoryCache _cache;

        private string EndpointBaseUrl => _configuration.GetValue<string>("RecommendationsApiEndpointBaseUrl");
        private string ApiKey => _configuration.GetValue<string>("RecommendationsApiKey");
        private int TimeOutSeconds => _configuration.GetValue<int>("RecommendationsApiTimeOutSeconds");
        private bool _logAllWebResponses => _configuration.GetValue<bool>("LogAllWebResponses");
        private int _defaultRetryLimit => _configuration.GetValue<int>("DefaultRetryLimit");
        private int _defaultRetryTimeoutGain => _configuration.GetValue<int>("DefaultRetryTimeoutGain");

        public ProductRecommendationWorker(IConfiguration configuration, ILogger<ProductRecommendationWorker> logger, IsampleWebRequest sampleWebRequest, IMemoryCache memoryCache)
        {
            _configuration = configuration;
            _logger = logger;
            _sampleWebRequest = sampleWebRequest;
            _cache = memoryCache;
        }

        public async Task<Models.External.RecommendationResponse> GetCrossShoppingProductsAsync(int chromeStyleId, string seedProductType, int numResults)
        {
            var apiParams = new Dictionary<string, object> {
                { "website", "sample" },
                { "seedProducttype", seedProductType },
                { "num_results", numResults },
                { "csweight", "1" },
            };

            if (seedProductType == "NEW")
            {
                // only get back new car's when the seed Product is new
                apiParams.Add("typefilter", "NEW");
            }

            return await GetResponse<Models.External.RecommendationResponse>(Constants.ApiEndpoints.Recommendations.SeedProductsample, apiParams);
        }

        private async Task<T> GetResponse<T>(string requestPath, Dictionary<string, object> apiParams)
        {
            string requestUrl = $"{EndpointBaseUrl}/recommendations/{requestPath}?{apiParams.AsQueryString()}";
            if (!_cache.TryGetValue(requestUrl, out T processedResponse))
            {
                SampleWebResponse response = await _sampleWebRequest.GetHttpWebResponseAsync(requestUrl, HttpMethod.Get, TimeOutSeconds, null, headers, contentType: "application/json", retryLimit: _defaultRetryLimit, retryTimeoutGain: _defaultRetryTimeoutGain);

                processedResponse = response.ProcessWebResponse<T>(requestUrl, _logAllWebResponses);
                if (processedResponse != null)
                {
                    _cache.Set(requestUrl, processedResponse, TimeSpan.FromSeconds(3600));
                }
            }

            return processedResponse;
        }

    }
}
