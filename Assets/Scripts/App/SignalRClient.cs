// using System;
// using Api;
// using Common;
// using Cysharp.Threading.Tasks;
// using Microsoft.AspNetCore.SignalR.Client;
// using Microsoft.Extensions.DependencyInjection;
// using UnityEngine;
//
// namespace App
// {
//     public class SignalRClient : Agent<SignalRClient>
//     {
//         private async void Start()
//         {
//             //await ConnectToHubAsync();
//            //System.Diagnostics.Tracing.EventSource.IsSupported = false;
//         }
//
//         public void AddText(string log)
//         {
//             Debug.Log(log);
//         }
//
//         private void Update()
//         {
//             if(connection == null) {
//                 connection = new HubConnectionBuilder().WithUrl("http://localhost:5000/TestHub")
//                     .WithAutomaticReconnect().AddMessagePackProtocol().Build();
//                 connection.On<string, string>("ReceiveMessage",
//                     (user, message) => Debug.Log($"{user}: {message}"));
//                 // // Set up server callable functions
//                 connection.On("Send",
//                     (string arg) =>
//                         AddText($"On '<color=green>Send</color>': '<color=yellow>{arg}</color>'"));
//                 connection.On<Person>("Person",
//                     (person) =>
//                         AddText(
//                             $"On '<color=green>Person</color>': '<color=yellow>{person}</color>'"));
//                 connection.On<Person, Person>("TwoPersons",
//                     (person1, person2) => AddText(
//                         $"On '<color=green>TwoPersons</color>': '<color=yellow>{person1}</color>', '<color=yellow>{person2}</color>'"));
//
//                 try {
//                     connection.StartAsync();
//                 }
//                 catch(Exception ex) {
//                     Debug.LogException(ex);
//                 }
//             }
//
//             if(connection.State != HubConnectionState.Connected) {
//                 timer += Time.deltaTime;
//
//                 if(timer > connectionDelay) {
//                     timer -= connectionDelay;
//                     Debug.Log($"start connection {connection.State}");
//
//                     try {
//                         connection.StartAsync();
//                     }
//                     catch(Exception ex) {
//                         Debug.LogException(ex);
//                     }
//                 }
//             }
//         }
//
//         private float timer;
//         private float connectionDelay = 1f;
//
//         public async UniTask<HubConnection> ConnectToHubAsync()
//         {
//             Debug.Log("ConnectToHubAsync start");
//
//             //Создаем соединение с нашим написанным тестовым хабом
//             connection = new HubConnectionBuilder().WithUrl("http://localhost:5000/TestHub")
//                 .WithAutomaticReconnect().Build();
//
//             //.WithAutomaticReconnect()
//
//             //  connection;
//             Debug.Log("connection handle created");
//             //connection.On()
//
//             // //подписываемся на сообщение от хаба, чтобы проверить подключение
//             connection.On<string, string>("ReceiveMessage",
//                 (user, message) => Debug.Log($"{user}: {message}"));
//             var timer = 0;
//
//             while((timer += 1) < 10 && connection.State != HubConnectionState.Connected) {
//                 try {
//                     if(connection.State == HubConnectionState.Connecting) {
//                         await UniTask.Delay(TimeSpan.FromSeconds(connectionDelay));
//                         continue;
//                     }
//                     Debug.Log("start connection");
//                     await connection.StartAsync();
//                     Debug.Log("connection finished");
//                 }
//                 catch(Exception e) {
//                     Debug.LogException(e);
//                 }
//             }
//             return connection;
//         }
//
//         public HubConnection connection { get; set; }
//     }
// }
