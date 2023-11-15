using System;
using System.Linq;
using System.Net;
using MessagePack;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SignalRServer.Filters;
using SignalRServer.Helpers;
using SignalRServer.Hubs;
using StackExchange.Redis;
using StackExchange.Redis.Extensions.Core;
using StackExchange.Redis.Extensions.Core.Configuration;
using StackExchange.Redis.Extensions.MsgPack;
using StackExchange.Redis.Extensions.Newtonsoft;
using WebSocketOptions = Microsoft.AspNetCore.Builder.WebSocketOptions;

namespace SignalRServer;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment env)
    {
        Configuration = configuration;
        this.env = env;
    }

    public IConfiguration Configuration { get; }

    readonly IWebHostEnvironment env;
    readonly string corsPolicy = "CorsPolicy ";

    public void ConfigureServices(IServiceCollection services)
    {
        var appSection = Configuration.GetSection("App");
        services.Configure<AppSetting>(option => appSection.Bind(option));
        var appSetting = appSection.Get<AppSetting>();

        services.AddSingleton<SignalrRedisHelper>();

        // services.AddCors();
        // services.AddRazorPages();
        //services.AddServerSideBlazor();
        services.AddResponseCompression(opts => {
            opts.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/octet-stream" });
        });

        services.AddSingleton<ISerializer, MsgPackObjectSerializer>();
        // services.AddStackExchangeRedisExtensions</*NewtonsoftSerializer*/MsgPackObjectSerializer>(new RedisConfiguration() {
        //     Name = "default",
        //     IsDefault = true,
        //     Hosts = new[] {
        //         new RedisHost() {
        //             Host = "icerock.fun",
        //             Port = 51002
        //         }
        //     }
        // });

        //Console.WriteLine($"Test: {appSetting.SignalrRedisCache.ConnectionString}");

        services.AddStackExchangeRedisCache(option => {
            option.Configuration = Configuration.GetConnectionString(appSetting.RedisCache.ConnectionString);
        });
        services.AddMvc(options => {
            options.EnableEndpointRouting = false;
        });

        services.AddSignalR(options => {
                options.EnableDetailedErrors = env.IsDevelopment();
                // options.KeepAliveInterval = TimeSpan.FromSeconds(300); //default: 15
                // options.MaximumReceiveMessageSize = 128;
                // options.MaximumParallelInvocationsPerClient = 5;
                
                options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
                //options.EnableDetailedErrors = false;
                options.HandshakeTimeout = TimeSpan.FromSeconds(15);
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                options.MaximumParallelInvocationsPerClient = 1;
                options.MaximumReceiveMessageSize = 256;// 32 * 1024;
                /*
                 * The default value of MaximumReceiveMessageSize is 32 KB. Increasing the value may increase the risk of Denial of service (DoS) attacks.
                 */
                options.StreamBufferCapacity = 10;
                
                
                // https://learn.microsoft.com/en-us/aspnet/core/signalr/hub-filters?view=aspnetcore-6.0
                // Global filters will run first
                //options.AddFilter<CustomFilter>();
            })
            .AddHubOptions<ChatHub>(hubOptions => {
                // https://learn.microsoft.com/en-us/aspnet/core/signalr/hub-filters?view=aspnetcore-6.0
                // Local filters will run second
                hubOptions.AddFilter(new CustomFilter());
            })
            .AddMessagePackProtocol(
                // options => {
                //     options.SerializerOptions = MessagePackSerializerOptions.Standard
                //         // .WithResolver(new CustomResolver())
                //         .WithSecurity(MessagePackSecurity.UntrustedData);
                // }
            )

            //.AddStackExchangeRedisCache()
            // 使用redis做底板 支持横向扩展 Scale-out
            .AddStackExchangeRedis(o => {
                o.ConnectionFactory = async writer => {
                    var config = new ConfigurationOptions {
                        AbortOnConnectFail = false,
                        // Password = "changeme",
                        ChannelPrefix = "__signalr_",
                    };
                    //config.EndPoints.Add(IPAddress.Loopback, 0);
                    //config.SetDefaultPorts();
                    config.DefaultDatabase = appSetting.SignalrRedisCache.DatabaseId;
                    var connection =
                        await ConnectionMultiplexer.ConnectAsync(appSetting.SignalrRedisCache.ConnectionString, writer);
                    connection.ConnectionFailed += (_, e) => {
                        Console.WriteLine("Connection to Redis failed.");
                    };

                    if (connection.IsConnected) {
                        Console.WriteLine("connected to Redis.");
                    }
                    else {
                        Console.WriteLine("Did not connect to Redis");
                    }

                    return connection;
                };
            });
        // .AddStackExchangeRedis("icerock.fun:51002", options => {
        //     options.Configuration.ChannelPrefix = "Server";
        // })
        // .AddStackExchangeRedis(o =>
        // {
        //     o.ConnectionFactory = async writer =>
        //     {
        //         var config = new ConfigurationOptions()
        //         {
        //             AbortOnConnectFail = false
        //         };
        //         config.EndPoints.Add(IPAddress.Loopback, 51002);
        //         config.SetDefaultPorts();
        //         var connection = await ConnectionMultiplexer.ConnectAsync(config, writer);
        //         connection.ConnectionFailed += (_, e) =>
        //         {
        //             Console.WriteLine("Connection to Redis failed.");
        //         };
        //
        //         if (!connection.IsConnected)
        //         {
        //             Console.WriteLine("Did not connect to Redis.");
        //         }
        //
        //         return connection;
        //     };
        // })
        ;
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseResponseCompression();
        if (env.IsDevelopment()) {
            app.UseDeveloperExceptionPage();
        }
        else {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        // app.UseCors(builder => {
        //     builder.WithOrigins("http://0.0.0.0:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials();
        // });

        //app.UseHttpsRedirection();
        app.UseStaticFiles();

        app.UseRouting();

        var webSocketOptions = new WebSocketOptions {
            KeepAliveInterval = TimeSpan.FromMinutes(2)
        };
        app.UseWebSockets(webSocketOptions);

        app.UseAuthorization(); // <<== The authentication middleware is placed before SignalR and Mvc
        //app.UseAuthentication();
        app.UseMvc();

        // Redis information "/redis/connectionInfo"
        // Redis information "/redis/info"
        //app.UseRedisInformation();

        // app.uses(hubRouteBuilder => {
        //     hubRouteBuilder.MapHub<ChatHub>("/chathub");
        // });

        /*
         *  Note
If you would like to accept WebSocket requests in a controller,
 the call to app.UseWebSockets must occur before app.UseEndpoints.
         */
        app.UseEndpoints(endpoints => {
            //endpoints.MapRazorPages();

            endpoints.MapGet("/", async context => {
                await context.Response.WriteAsync("Unity-WebGL-SignalR-Server");
            });

            endpoints.MapHub<MainHub>("/MainHub", options => {
                options.Transports = HttpTransportType.LongPolling /* | HttpTransportType.WebSockets*/;
                //  /* HttpTransportType.LongPolling |*/ HttpTransportType.WebSockets;
            });
            endpoints.MapHub<ChatHub>("/chatHub", options => {
                options.Transports = HttpTransportType.LongPolling /*| HttpTransportType.WebSockets*/;
                // /*HttpTransportType.LongPolling |*/ HttpTransportType.WebSockets;
            });
            //endpoints.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
            //endpoints.MapRazorPages();
            //endpoints.MapFallbackToPage("/_Host");
        });
    }
}