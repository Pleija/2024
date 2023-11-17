using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BestHTTP_DemoSite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args).ConfigureKestrel((context, serverOptions) =>
                {
                    serverOptions.Listen(IPAddress.Any, 5000);
                    // serverOptions.Listen(IPAddress.Loopback, 5001, listenOptions =>
                    // {
                    //     listenOptions.UseHttps("testCert.pfx", "testPassword");
                    // });
                })
                .UseStartup<Startup>();
    }
}
