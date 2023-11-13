// using System;
// using System.Threading.Tasks;
// using BestHTTP.SignalRCore;
// using BestHTTP.SignalR;
// using BestHTTP.SignalR.Hubs;
// using UnityEngine;
//
// //using WebSocketSharp;
//
// public class Server
// {
//     private static HubConnection _hubConnection;
//
//     public static Connection signalRConnection {
//         get {
//             if (_signalRConnection == null) {
//                 SetupSignalRHubAsync();
//             }
//
//             return _signalRConnection;
//         }
//         protected set => _signalRConnection = value;
//     }
//
//     protected static Connection _signalRConnection;
//
//     protected static void SetupSignalRHubAsync()
//     {
//         Uri uri = new Uri("http://127.0.0.1:5000/");
//         Hub hub = new Hub("MainHub");
//         signalRConnection = new Connection(uri, hub);
//         signalRConnection.OnConnected += (con) => Debug.Log("Connected to the SignalR server!");
//         signalRConnection.OnClosed += (con) => Debug.Log("Connection Closed");
//         signalRConnection.OnError += (conn, err) => Debug.Log("Error: " + err);
//         signalRConnection.OnReconnecting += (con) => Debug.Log("Reconnecting");
//         signalRConnection.OnReconnecting += (con) => Debug.Log("Reconnected");
//         signalRConnection.OnStateChanged += (conn, oldState, newState) =>
//             Debug.Log(string.Format("State Changed {0} -> {1}", oldState, newState));
//         signalRConnection.OnNonHubMessage += (con, data) => Debug.Log("Message from server: " + data.ToString());
//         signalRConnection.RequestPreparator = (con, req, type) => req.Timeout = TimeSpan.FromSeconds(5);
//         signalRConnection.Open();
//
//         // _hubConnection = new HubConnectionBuilder()
//         //     .WithUrl("https://localhost:44324/loopymessage")
//         //     .AddMessagePackProtocol()
//         //     .ConfigureLogging(factory =>
//         //     {
//         //         factory.AddConsole();
//         //         factory.AddFilter("Console", level => level >= LogLevel.Trace);
//         //     }).Build();
//         //
//         // await _hubConnection.StartAsync();
//     }
// }