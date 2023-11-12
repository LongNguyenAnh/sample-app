using System.Threading.Tasks;

namespace Sample.Workers
{
    public interface IProductRecommendationWorker
    {
        Task<Models.External.RecommendationResponse> GetCrossShoppingProductsAsync(int chromeStyleId, string seedProductType, int numResults);
    }
}
