using Microsoft.AspNetCore.Mvc;

namespace Sample.Controllers
{
    [Produces("application/json")]
    [Route("sample/healthcheck")]
    [ApiExplorerSettings(IgnoreApi = true)]

    public class HealthcheckController : Controller
    {
        public HealthcheckController()
        {
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(true);
        }
    }
}