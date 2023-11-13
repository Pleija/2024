using System.Net;
using System.Net.WebSockets;
using System.Text;
using GrpcService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:6666");

// Additional configuration is required to successfully run gRPC on macOS.
// For instructions on how to configure Kestrel and gRPC clients on macOS, visit https://go.microsoft.com/fwlink/?linkid=2099682

// Add services to the container.
builder.Services.AddGrpc();

var app = builder.Build();
app.UseWebSockets();

// Configure the HTTP request pipeline.
app.MapGrpcService<GreeterService>();
app.MapGet("/", () => "Nice");

app.Map("/ws", async context => {
    if (context.WebSockets.IsWebSocketRequest) {
        using (var webSocket = await context.WebSockets.AcceptWebSocketAsync()) {
            while (true) {
                await webSocket.SendAsync(Encoding.ASCII.GetBytes($"Test - {DateTime.Now}"), WebSocketMessageType.Text,
                    true, CancellationToken.None);
                await Task.Delay(1000);
            }
        }
    }
    else {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    }
});

//app.Run();
await app.RunAsync();