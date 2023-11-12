using Amazon.Extensions.NETCore.Setup;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using Amazon;

namespace Sample
{
    public class Program
    {
        public static void Main(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddSystemsManager("/CodeBuild/", new AWSOptions { Region = RegionEndpoint.USEast1 })
                .Build();

            Environment.SetEnvironmentVariable("Key", "Value");

            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}