using System;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SignalRServer;

public class Program
{
    //private static X509Certificate2 certificate;

    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) => 
        Host.CreateDefaultBuilder(args)
            .ConfigureLogging(logging =>
            {
                logging.AddFilter("Microsoft.AspNetCore.SignalR", LogLevel.Debug);
                logging.AddFilter("Microsoft.AspNetCore.Http.Connections", LogLevel.Debug);
            })
        .ConfigureWebHostDefaults(webBuilder => {
            var config = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                .AddEnvironmentVariables()
                .AddJsonFile("certificate.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"certificate.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
                    optional: true, reloadOnChange: true)
                .Build();

            var certificateSettings = config.GetSection("certificateSettings");
            string certificateFileName = certificateSettings.GetValue<string>("filename");
            string certificatePassword = certificateSettings.GetValue<string>("password");

            var certificate = new X509Certificate2(certificateFileName, certificatePassword);
            
            
            webBuilder.ConfigureKestrel(aOptions => {
                    aOptions.AddServerHeader = false;
                    aOptions.Listen(IPAddress.Any, 5000, listenOptions => {
                        listenOptions.UseHttps(certificate);
                    });
                    
                    aOptions.Listen(IPAddress.Any, 5001, listenOptions => {
                       // listenOptions.UseHttps(certificate);
                    });
                })
                .UseConfiguration(config)
                //add
                .UseContentRoot(Directory.GetCurrentDirectory());
            webBuilder.UseStartup<Startup>();
        });
}