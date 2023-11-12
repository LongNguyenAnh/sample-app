using Sample.Models;
using Sample.Workers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Sample.Controllers
{
    [Produces("application/json")]
    [Route("sample")]
    public class PriceController : BaseController
    {
        private readonly IWebApiWorker _webApiWorker;

        public PriceController(ILogger<PriceController> logger, IWebApiWorker webApiWorker) : base(logger)
        {
            _webApiWorker = webApiWorker;
        }

        [ProducesResponseType(typeof(VrsPrice), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.InternalServerError)]
        [HttpGet("pricerange")]
        public async Task<IActionResult> GetPriceRangeAsync([Required] int productId, string priceType = null, string condition = null, string options = null, string zipCode = null)
        {
            if (productId <= 0)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, "Product Id is required");
            }

            VrsPrice priceRange = await _webApiWorker.GetPriceRangeAsync(productId, priceType, condition, options, zipCode);  

            return Ok(priceRange);
        }
    }
}
