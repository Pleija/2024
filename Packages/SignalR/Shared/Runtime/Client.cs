using UnityEngine;
using WebSocketSharp;
using WebSocketSharp.Net;

public class Client : MonoBehaviour
{
    public static WebSocket ws;
    public void Start()
    {
        if(ws != null) return;
        // ws = new WebSocket("wss://localhost:4649/Chat", new WebSocketSharp.Net.ClientSslConfiguration() {
        //
        // });
    }
}