using Sample.Constants;
using Sample.Models;
using Sample.Workers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Linq;
using SampleSDK.Inventory;
using SampleSDK.Inventory.Models;
using static Sample.Constants.ProductInventory;

namespace Sample.Controllers
{
    [Produces("application/json")]
    [Route("sample")]
    public class InventoryController : BaseController
    {
        private readonly IWebApiWorker _webApiWorker;

        public InventoryController(ILogger<InventoryController> logger, IWebApiWorker webApiWorker) : base(logger)
        {
            _webApiWorker = webApiWorker;
        }

        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.InternalServerError)]
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventoryAsync(string name, int? productId = null, string priceType = null)
        {
            if (string.IsNullOrEmpty(name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest, "Name is required.");
            }
            

            object inventory = await _webApiWorker.GetInventoryAsync(name, int? productId = null, priceType);      

            return Ok(inventory);
        }
    }
}