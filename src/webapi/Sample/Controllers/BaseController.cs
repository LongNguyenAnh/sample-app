using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System.Net;

namespace Sample.Controllers
{
    public class BaseController : Controller
    {
        public ILogger Logger { get; private set; }

        public BaseController(ILogger logger) : base()
        {
            Logger = logger;
        }

        public override ObjectResult StatusCode(int statusCode, object value)
        {
            Logger.LogError($"{(HttpStatusCode)statusCode}. {value}");
            return base.StatusCode(statusCode, value);
        }
    }

    public class RequireParameterAttribute : ActionMethodSelectorAttribute
    {
        public RequireParameterAttribute(string keyName)
        {
            KeyName = keyName;
        }
        public override bool IsValidForRequest(RouteContext routeContext, ActionDescriptor actionInfo)
        {
            return routeContext.HttpContext.Request.QueryString.ToString().Contains(KeyName);
        }

        public string KeyName { get; private set; }
    }
}
