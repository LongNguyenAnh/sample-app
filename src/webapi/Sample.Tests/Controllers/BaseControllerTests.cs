using System;
using FluentAssertions;
using Sample.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Routing;
using Moq;
using Xunit;

namespace Sample.Tests.Controllers
{
	public class BaseControllerTests
	{
		public BaseControllerTests()
		{
		}

		#region RequireParameterAttribute

		[Fact]
		public void BaseController_RequireParameterAttribute_Constructor_ShouldReturnCorrectKey()
		{
			//arrange
			string keyName = "key";
			RequireParameterAttribute mock = new RequireParameterAttribute(keyName);

			//act
			string result = mock.KeyName;

			//assert
			result.Should().NotBeNullOrEmpty();
			result.Should().Be(keyName);
		}

		[Fact]
		public void BaseController_RequireParameterAttribute_IsValidForRequest_ShouldReturnFalse()
		{
			//arrange
			string keyName = "key";
			RequireParameterAttribute mock = new RequireParameterAttribute(keyName);

			var httpRequest = Mock.Of<HttpRequest>();
			var httpContext = new Mock<HttpContext>();
			httpContext.SetupGet(c => c.Request)
					   .Returns(httpRequest);
			httpContext.SetupGet(c => c.RequestServices)
					   .Returns(Mock.Of<IServiceProvider>());
			var routeContext = new RouteContext(httpContext.Object);

			ActionDescriptor mockActionDescriptor = null;

			//act
			bool result = mock.IsValidForRequest(routeContext,mockActionDescriptor);

			//assert
			result.Should().BeFalse();
		}
		#endregion
	}
}

