using System.Security.Cryptography.X509Certificates;
using WebSocketSharp.Server;

public class WsServer
{
    /// <summary>
    /// https://github.com/sta/websocket-sharp
    /// </summary>
    public void StartWsServer()
    {
        var wssServer = new WebSocketServer(5963, true);
        wssServer.SslConfiguration.ServerCertificate = new X509Certificate2(
            "/path/to/cert.pfx", "password for cert.pfx");
    }

    /// <summary>
    /// https://github.com/sta/websocket-sharp
    /// </summary>
    public void StartHttpServer()
    {
        var httpServer = new HttpServer(5953);
        httpServer.OnGet += ((x, e) => { });
        httpServer.OnPost += ((x, e) => { });

        // wssv.SslConfiguration.ServerCertificate = new X509Certificate2 (
        //     "/path/to/cert.pfx", "password for cert.pfx"
        // );
    }
}