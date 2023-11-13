using System.Security.Cryptography.X509Certificates;
using System.Text;
using UnityEngine;
using WebSocketSharp;
using WebSocketSharp.Net;
using WebSocketSharp.Server;

public class Server : MonoBehaviour
{
    private static Server m_Instance;

    public static Server self {
        get {
            m_Instance ??= FindObjectOfType<Server>();

            if(!m_Instance) {
                m_Instance = new GameObject("Server").AddComponent<Server>();
                DontDestroyOnLoad(m_Instance.gameObject);
            }
            return m_Instance;
        }
    }

    public void Start()
    {
        X509Certificate2 x509Certificate = new X509Certificate2(
            Encoding.ASCII.GetBytes(Resources.Load<TextAsset>("Keys/myapp.crt").text), "7758");
        //var wssv = new WebSocketServer (4649);
        var wssv = new WebSocketServer(4649, true);
        wssv.SslConfiguration.ServerCertificate = x509Certificate;
        wssv.SslConfiguration.CheckCertificateRevocation = false;
        wssv.SslConfiguration.ClientCertificateRequired = false;
        wssv.SslConfiguration.ClientCertificateValidationCallback =
            (sender, certificate, chain, sslPolicyErrors) => true;
        //var wssv = new WebSocketServer ("ws://localhost:4649");
        //var wssv = new WebSocketServer ("wss://localhost:4649");
#if DEBUG
        wssv.Log.Level = LogLevel.Trace;
#endif
        //var cert = ConfigurationManager.AppSettings ["ServerCertFile"];
        //var password = ConfigurationManager.AppSettings ["CertFilePassword"];

        //new X509Certificate2 (cert, password);
        wssv.KeepClean = false;
        wssv.AddWebSocketService<Echo>("/Echo");
        wssv.AddWebSocketService<Chat>("/Chat");
        //wssv.AddWebSocketService<Chat> ("/Chat", () => new Chat ("Anon#"));
        //wssv.AddWebSocketService<Echo> ("/エコー");
        //wssv.AddWebSocketService<Chat> ("/チャット");
        wssv.Start();
    }
}
