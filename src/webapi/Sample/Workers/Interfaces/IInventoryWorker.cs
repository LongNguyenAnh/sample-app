using sample.Researchable.Shared.Models;
using Sample.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sample.Workers
{
    public interface IInventoryWorker
    {
        Task<ResponseDTO<ListingDTO>> GetListingsAsync(SearchCriteriaDTO searchCriteria, bool cacheResponse = false);
        Task<ResponseDTO<ListingDTO>> GetInventoryAsync(int yearId);
    }
}
