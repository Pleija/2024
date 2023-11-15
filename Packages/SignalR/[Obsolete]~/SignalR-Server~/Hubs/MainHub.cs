using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using Shared.Menu;

namespace SignalRServer.Hubs
{
    public class MainHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine(Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public async Task SendPayloadA(string payload)
        {
            var data = JsonSerializer.Deserialize<dynamic>(payload);
            string json = JsonSerializer.Serialize(data);
            await Clients.All.SendAsync("ReceivePayloadA", json);
        }

        public async Task SendMessage(string user, string message, string room, bool join)
        {
            if (join) {
                await JoinRoom(room).ConfigureAwait(false);
                await Clients.Group(room).SendAsync("ReceiveMessage", user, " joined to " + room).ConfigureAwait(true);
            }
            else {
                await Clients.Group(room).SendAsync("ReceiveMessage", user, message).ConfigureAwait(true);
            }
        }

        public Task JoinRoom(string roomName)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        }

        public Task LeaveRoom(string roomName)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        }

        public async Task SendPayloadB(string payload)
        {
            var data = JsonSerializer.Deserialize<dynamic>(payload);
            string json = JsonSerializer.Serialize(data);
            await Clients.All.SendAsync("ReceivePayloadB", json);
        }

        public async Task Login(LoginRpc data)
        {
            await Clients.All.SendAsync("Send", data);
        }
    }
}