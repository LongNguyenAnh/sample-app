using Researchable.Shared.Models;
using Sample.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sample.Workers
{
    public interface IProductSelectionWorker
    {
        Task<Product> GetDefaultProductAsync(int productId);
        Task<Product> GetDefaultProductAsync(string name, int? productId = null, string priceType = null);        
        Task<List<Product>> GetAvailableProductsAsync(string name = null);
    }
}
