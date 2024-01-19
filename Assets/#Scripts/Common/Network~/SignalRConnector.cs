using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Connections;
using UnityEngine;
using Microsoft.AspNetCore.SignalR.Client;

public class Message
{
    public string UserName { get; set; }
    public string Text { get; set; }
}

public class SignalRConnector
{
    public Action<Message> OnMessageReceived;
    private HubConnection connection;

    public async Task InitAsync()
    {
        connection = new HubConnectionBuilder().WithUrl("http://localhost:5000/chatHub",
            HttpTransportType.WebSockets | HttpTransportType.LongPolling, options =>
            {
                options.SkipNegotiation = true;
            }).Build();
        connection.On<string, string>("ReceiveMessage", (user, message) => {
            OnMessageReceived?.Invoke(new Message {
                UserName = user,
                Text = message,
            });
        });
        await StartConnectionAsync();
    }

    public async Task SendMessageAsync(Message message)
    {
        try {
            await connection.InvokeAsync("SendMessage", message.UserName, message.Text);
        }
        catch(Exception ex) {
            Debug.LogException(ex);
           // UnityEngine.Debug.LogError($"Error {ex.Message}");
        }
    }

    private async Task StartConnectionAsync()
    {
        try {
            await connection.StartAsync();
        }
        catch(Exception ex) {
            UnityEngine.Debug.LogError($"Error {ex.Message}");
        }
    }
}
