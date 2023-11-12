using Amazon.Lambda.Core;
using Amazon.S3;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using AutoMapper.Configuration;
using Sample.RoutingService;
using Sample.WebRequest;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using OpenTracing;
using OpenTracing.Tag;
using OpenTracing.Util;
using System.Collections.Generic;
using System.Net;
using System.Text.Json.Serialization;

namespace Sample
{
    public class Startup
    {
        public IWebHostEnvironment CurrentHostingEnvironment { get; private set; }
        public Microsoft.Extensions.Configuration.IConfiguration Configuration { get; private set; }

        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
            CurrentHostingEnvironment = env;

#if !DEBUG
            AWSSDKHandler.RegisterXRayForAllServices();
#endif
        }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMemoryCache();
            services.AddOpenTracing();

            services.AddControllers().AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            services.AddMvc()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.NullValueHandling = NullValueHandling.Include;
                    options.SerializerSettings.DefaultValueHandling = DefaultValueHandling.Include;
                });

            services.AddSingleton(Configuration);
            services.AddDefaultAWSOptions(Configuration.GetAWSOptions());
            services.AddScoped<ISampleWebRequest, SampleWebRequest>();
            services.AddScoped<IWebApiWorker, WebApiWorker>();
            services.AddScoped<IProductSelectionWorker, ProductSelectionWorker>();
            services.AddScoped<IS3ClientWorker, S3ClientWorker>();
            services.AddScoped<IInventoryWorker, InventoryWorker>();
            services.AddScoped<IProductRecommendationWorker, ProductRecommendationWorker>();
            services.AddAWSService<IAmazonS3>();
#if !prod
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "sample API", Version = "v1" });
            });
#endif
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseExceptionHandler(options =>
            {
                options.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var ex = context.Features.Get<IExceptionHandlerFeature>();
                    if (ex != null)
                    {
                        var err = env.IsDevelopment() ? $"<h1>Error: {ex.Error.Message}</h1>{ ex.Error.StackTrace }" : ex.Error.Message;
                        await context.Response.WriteAsync(err).ConfigureAwait(false);

                        var span = GlobalTracer.Instance.ActiveSpan;
                        span.SetTag(Tags.Error, true);
                        span.Log(new Dictionary<string, object>()
                        {
                            { LogFields.Event, Tags.Error.Key },
                            { LogFields.ErrorObject, ex.Error },
                            { LogFields.Message, ex.Error.Message },
                            { LogFields.Stack, ex.Error.StackTrace },
                            { LogFields.ErrorKind, ex.Error.GetType().Name }
                        });

                        LambdaLogger.Log(JsonConvert.SerializeObject(ex));
                    }
                });
            });

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

#if !prod
            app.UseSwagger(c =>
            {
                c.RouteTemplate = "sample/swagger/{documentName}/swagger.json";
            });

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/sample/swagger/v1/swagger.json", "sample API");
                c.RoutePrefix = "sample/swagger";
            });
#endif
            Sample.Configuration.AutoMapperConfiguration.Initialize();
        }
    }
}
