using AutoMapper;
using Researchable.Shared.Models;
using Sample.Constants;
using Sample.Extensions;
using Sample.Helpers;
using Sample.Models;
using Sample.Models.RankTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sample.Workers
{
    public class ProductSelectionWorker : IProductSelectionWorker
    {
        private readonly IResearchableApiWorker _researchableApiWorker;

        public ProductSelectionWorker(IResearchableApiWorker researchableApiWorker)
        {
            _researchableApiWorker = researchableApiWorker;
        }

        public async Task<Product> GetDefaultProductAsync(int productId)
        {
            return await _researchableApiWorker.GetProductById(productId);
        }

        public async Task<Product> GetDefaultProductAsync(string make, int? productId = null)
        {
            //todo: if productId does not yet exist in trim details, then grab next default product?
            if (productId.HasValue && productId > 0)
            {
                return await GetDefaultProductAsync(productId.Value);
            }

            List<Product> productData = await GetDefaultProductDataAsync(name);
            return productData == null || !productData.Any() ? null : productData.FirstOrDefault();
        }

        public async Task<List<Product>> GetAvailableProductsAsync(string name = null)
        {
            //filter with given parameters
            List<Product> filteredProducts = await _researchableApiWorker.GetProductsAsync(name);
            if (filteredProducts == null || !filteredProducts.Any())
            {
                //filter without productClass
                filteredProducts = await _researchableApiWorker.GetProductsAsync(name);
            }

            return filteredProducts;
        }

        private async Task<List<Product>> GetDefaultProductDataAsync(string name)
        {
            //return productData;
        }

        private async Task<List<Product>> GetProductsAsync(string make)
        {
        }
    }
}
