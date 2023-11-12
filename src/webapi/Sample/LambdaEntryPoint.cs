using System;
using System.IO;
using System.Threading.Tasks;
using Amazon.Lambda.ApplicationLoadBalancerEvents;
using Amazon.Lambda.AspNetCoreServer;
using Amazon.Lambda.Core;
using Microsoft.AspNetCore.Hosting;
using NewRelic.OpenTracing.AmazonLambda;
using OpenTracing.Util;

namespace Sample
{
    /// <summary>
    /// This class extends from APIGatewayProxyFunction which contains the method FunctionHandlerAsync which is the 
    /// actual Lambda function entry point. The Lambda handler field should be set to
    /// 
    /// AWSServerless2::AWSServerless2.LambdaEntryPoint::FunctionHandlerAsync
    /// </summary>
    public class LambdaEntryPoint : ApplicationLoadBalancerFunction
    {
        static LambdaEntryPoint()
        {
            GlobalTracer.Register(LambdaTracer.Instance);
        }

        [LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]
        public Task<ApplicationLoadBalancerResponse> TracedFunctionHandlerAsync(ApplicationLoadBalancerRequest invocationEvent, ILambdaContext context)
        {
            return new TracingRequestHandler().LambdaWrapper(FunctionHandlerAsync, invocationEvent, context);
        }

        public override Task<ApplicationLoadBalancerResponse> FunctionHandlerAsync(ApplicationLoadBalancerRequest invocationEvent, ILambdaContext context)
        {
            // We need to set the span here before .NET intializes or else it wont make it to the AwsLambdaInvocation table
            var span = GlobalTracer.Instance?.ActiveSpan;
            span?.SetOperationName($"WebApi/{invocationEvent.HttpMethod}{invocationEvent.Path}");

            return base.FunctionHandlerAsync(invocationEvent, context);
        }

        /// <summary>
        /// The builder has configuration, logging and Amazon API Gateway already configured. The startup class
        /// needs to be configured in this method using the UseStartup<>() method.
        /// </summary>
        /// <param name="builder"></param>
        protected override void Init(IWebHostBuilder builder)
        {
            builder
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseStartup<Startup>()
                .UseLambdaServer();
        }
    }
}
