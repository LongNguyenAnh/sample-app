using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Sample.Tests.Controllers
{
    public class UnitTestHelper
    {
        public static ControllerContext createMockContext(string action)
        {
            ControllerContext context = new ControllerContext();
            context.HttpContext = new DefaultHttpContext();
            context.HttpContext.Request.Path = $"/{action}";
            context.HttpContext.Request.Protocol = "HTTP/1.1";
            context.HttpContext.Request.Method = "GET";
            context.HttpContext.Request.Host = new HostString("localhost", 7946);
            context.HttpContext.Request.Scheme = "http";
            return context;
        }
    }
}