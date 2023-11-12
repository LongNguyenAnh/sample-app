using Sample.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sample.Workers
{
    public interface IWebApiWorker
    {
        Task<List<int>> GetValidProductOptionsAsync(int productId);
        Task<object> GetInventoryAsync(string make, int? productId = null, string priceType = null);
    }
}
