using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using RocksDbSharp;

namespace SignalRServer.Hubs;

public class ChatHub : Hub
{
    /// <summary>
    /// Called when a new connection is established with the hub.
    /// </summary>
    /// <returns>A <see cref="T:System.Threading.Tasks.Task" /> that represents the asynchronous connect.</returns>
    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "SignalR Users");

        await base.OnConnectedAsync();
        
    }
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
        await base.OnDisconnectedAsync(exception);
    }
    

    private static bool testRocksDb { get; } = true;

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, /*message*/$"{user} says: {message}");
    }
    
    /// <summary>
    ///     Subscribers can join groups by simply supplying a group name. If the group does not exist it will automatically be
    ///     created.
    /// </summary>
    /// <param name="groupName"></param>
    /// <returns></returns>
    public async Task JoinGroup(string groupName)
    {
        await this.Groups.AddToGroupAsync(this.Context.ConnectionId, groupName);
        await this.Clients.Group(groupName).SendAsync("Send", $"{this.Context.ConnectionId} joined {groupName}");
    }
    

    public async Task TestRockDb()
    {
        // use Tendis instead
        if (testRocksDb) {
            var options = new DbOptions().SetCreateIfMissing(true);
            using (var db = RocksDb.Open(options, "rocks.db")) {
                // Using strings below, but can also use byte arrays for both keys and values
                // much care has been taken to minimize buffer copying
                db.Put("key", "value");
                string value = db.Get("key");
                db.Remove("key");
            }
        }

        await Task.CompletedTask;
    }
}