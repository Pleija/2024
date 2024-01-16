using System;
using System.IO;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Org.BouncyCastle.Crypto.Tls;
using UnityEditor;
using UnityEngine;
using WebSocketSharp;
using WebSocketSharp.Server;

public class WsServer
{
    public class WsService : WebSocketBehavior
    {
        protected override void OnMessage(MessageEventArgs e)
        {
            var msg = e.Data == "BALUS" ? "Are you kidding?" : "I'm not available now.";
            Send(msg);
        }
    }

    public static WebSocketServer wssServer;

    /// <summary>
    /// https://github.com/sta/websocket-sharp
    /// </summary>
    [InitializeOnLoadMethod, MenuItem("Debug/Websocket server"), InitializeOnEnterPlayMode]
    public static void StartWsServer()
    {
        EditorApplication.playModeStateChanged -= OnEditorApplicationOnplayModeStateChanged;
        EditorApplication.playModeStateChanged += OnEditorApplicationOnplayModeStateChanged;
        if (!(wssServer is { IsListening: true })) Restart();
        var ws = new WebSocket("ws://192.168.1.65:5963/app");
        // ws.SslConfiguration.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => {
        //     Debug.Log(certificate.GetCertHashString());
        //     // Do something to validate the server certificate.
        //     return true; // If the server certificate is valid.
        // };
        ws.Log.Level = LogLevel.Trace;
        ws.OnOpen += (sender, e) => ws.Send("Hi, there!");
        ws.OnMessage += (sender, e) => {
            var fmt = "[WebSocket Message] {0}";
            var body = !e.IsPing ? e.Data : "A ping was received.";
            Debug.LogFormat(fmt, body);
        };
        ws.OnError += (sender, e) => {
            var fmt = "[WebSocket Error] {0}";
            Debug.LogFormat(fmt, e.Message);
        };
        ws.OnClose += (sender, e) => {
            var fmt = "[WebSocket Close ({0})] {1}";
            Debug.LogFormat(fmt, e.Code, e.Reason);
        };
        ws.Connect();
        ws.Send("test");
    }

    private static void OnEditorApplicationOnplayModeStateChanged(PlayModeStateChange mode)
    {
        //  if (mode == PlayModeStateChange.EnteredEditMode || mode == PlayModeStateChange.EnteredPlayMode) {
        if (!(wssServer is { IsListening: true })) {
            Restart();
        }
        else {
            Debug.Log($"{mode} => Websocket ready");
        }
        //   }
    }

    static void Restart()
    {
        Debug.Log("restart ws server");
        wssServer?.Stop();
        wssServer = new WebSocketServer(5963, false) {
            // SslConfiguration = {
            //     ServerCertificate = new X509Certificate2(
            //         /*"/path/to/cert.pfx"*/"Assets/Editor/Websockets/Pfx/certificate.pfx",
            //         /*"password for cert.pfx"*/"7758"),
            //     ClientCertificateRequired = false,
            //     CheckCertificateRevocation = false,
            //     ClientCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true,
            // },
        };
        wssServer.AddWebSocketService<WsService>("/app");
        wssServer.Start();
        Debug.Log($"started: {wssServer.IsListening}");
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
