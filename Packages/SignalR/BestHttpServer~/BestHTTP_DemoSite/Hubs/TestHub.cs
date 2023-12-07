using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Channels;
using System.Threading.Tasks;
using Api;
using HashidsNet;
using MessagePack;
using Microsoft.AspNetCore.Connections.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Debug = System.Diagnostics.Debug;
using Random = System.Random;

namespace Hubs
{
    // public enum PersonStates
    // {
    //     Unknown,
    //     Joined
    // }
    //
    // public class Person
    // {
    //     public Vector3[] Positions { get; set; }
    //     public string Name { get; set; }
    //     public long Age { get; set; }
    //     public DateTime Joined { get; set; }
    //     public PersonStates State { get; set; }
    //     public List<Person> Friends { get; set; }
    //
    //     public override string ToString()
    //     {
    //         return string.Format("[Person Name: '{0}', Age: {1}]", this.Name, this.Age.ToString());
    //     }
    // }
    //
    // public enum MyEnum : int
    // {
    //     None,
    //     One,
    //     Two
    // }
    //
    // public sealed class Metadata
    // {
    //     public string strData;
    //     public int intData;
    //     public MyEnum myEnum;
    // }

    public class TestHub : Hub
    {
        Random rand = new Random();
        PersonStates[] states = null;
        private Dictionary<string, UserData> users = new Dictionary<string, UserData>();
        private MethodInfo[] methods;
        private Hashids sid => HashId.self;

        private UserData user => users.TryGetValue(Context.ConnectionId, out var ret) ? ret
            : users[Context.ConnectionId] = new UserData();

        public (ResultStatus status, byte[] data) Q(ApiFunc id, byte[] key, byte[] data)
        {
            var dec = XJson.Decrypt(key, data.MD5());

            if(dec == null) {
                Context.Abort();
                return (ResultStatus.DecryptError, null);
            }
            var index = MessagePackSerializer.Deserialize<long>(dec);

            if(index <= user.index) {
                Context.Abort();
                return (ResultStatus.KeyError, null);
            }
            user.index = index;
            var names = Enum.GetNames<ApiFunc>();
            methods ??= GetType().GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .Where(x => names.Contains(x.Name)).ToArray();
            var method = methods.FirstOrDefault(x => x.Name == $"{id}");
            if(method == null) return (ResultStatus.MethodNotFound, null);
            var types = method.GetParameters().Select(x => x.ParameterType).ToArray();

            if(!types.Any()) {
                return (ResultStatus.Success,
                    XJson.Encrypt(MessagePackSerializer.Serialize(method.Invoke(this, null)),
                        data.MD5(index)));
            }
            var decrypt = NetConfig.Des(types, XJson.Decrypt(data, index.MD5()));
            return (ResultStatus.Success,
                XJson.Encrypt(MessagePackSerializer.Serialize(decrypt), data.MD5(index)));

            // if(id == CallType.GetTimestamp) {
            //     // var fid = sid.DecodeLong(index);
            //     //
            //     // if(!fid.Any() || fid[0] != 1) {
            //     //     return 0.Bytes();
            //     // }
            //     return Encoding.UTF8.GetBytes(sid.EncodeLong(user.timestamp =
            //         DateTimeOffset.UtcNow.ToUnixTimeSeconds()));
            // }
            // return null;
        }

        // public void DoReg(Reg data)
        // {
        //     var hashId = new Hashids();
        //     var ret = data.Data;
        //     var t = hashId.DecodeLong(ret.query);
        //
        //     if(t.Length == 2) {
        //         var timestamp = t[0]; // 客户端初始timestamp
        //         var frame = t[1];// 调用的帧必须比之前调用的帧大,防止重放攻击
        //         ret.res = hashId.EncodeLong(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
        //         data.Data = ret;
        //     }
        // }

        private Person CreatePerson(bool createFriends = true)
        {
            if(states == null)
                states = Enum.GetValues<PersonStates>();
            var person = new Person {
                Name = "Name_" + rand.Next(),
                Age = rand.Next(20, 99),
                Joined = DateTime.Now,
                State = states[rand.Next(0, states.Length)],
                Positions = new UnityEngine.Vector3[] {
                    new UnityEngine.Vector3(rand.Next(0, 100), rand.Next(0, 100), rand.Next(0, 100))
                }
            };

            if(createFriends && rand.Next(0, 100) < 50) {
                person.Friends = new List<Person>();
                int count = rand.Next(1, 5);
                for(int i = 0; i < count; ++i)
                    person.Friends.Add(CreatePerson(false));
            }
            return person;
        }

        public long GetTimestamp(long timestamp, string guid)
        {
            user.timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            return timestamp;
        }

        public override async Task OnConnectedAsync()
        {
            var feature = Context.Features.Get<IHttpConnectionFeature>();
            var remoteIp = feature.RemoteIpAddress;
            Debug.WriteLine($"IP: {remoteIp}");
            // await Clients.All.SendAsync("Send", $"{Context.ConnectionId} joined");
            await Clients.Client(Context.ConnectionId)
                .SendAsync("Send", $"{Context.ConnectionId} joined IP: {remoteIp}");
            await Clients.Client(Context.ConnectionId).SendAsync("Person", CreatePerson());
            await Clients.Client(Context.ConnectionId)
                .SendAsync("TwoPersons", CreatePerson(), CreatePerson());
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            await Clients.Others.SendAsync("Send", $"{Context.ConnectionId} left");
        }

        public void SendMetadata(Metadata metadata)
        {
            Debug.WriteLine("SendMetadata");
        }

        public Task Send(string message)
        {
            return Clients.All.SendAsync("Send", $"{Context.ConnectionId}: {message}");
        }

        public Task SendToOthers(string message)
        {
            return Clients.Others.SendAsync("Send", $"{Context.ConnectionId}: {message}");
        }

        public Task SendToConnection(string connectionId, string message)
        {
            return Clients.Client(connectionId).SendAsync("Send",
                $"Private message from {Context.ConnectionId}: {message}");
        }

        public Task SendToGroup(string groupName, string message)
        {
            return Clients.Group(groupName)
                .SendAsync("Send", $"{Context.ConnectionId}@{groupName}: {message}");
        }

        public Task SendToOthersInGroup(string groupName, string message)
        {
            return Clients.OthersInGroup(groupName)
                .SendAsync("Send", $"{Context.ConnectionId}@{groupName}: {message}");
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName)
                .SendAsync("Send", $"{Context.ConnectionId} joined {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Clients.Group(groupName)
                .SendAsync("Send", $"{Context.ConnectionId} left {groupName}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public Task Echo(string message)
        {
            return Clients.Caller.SendAsync("Send", $"{Context.ConnectionId}: {message}");
        }

        public Person GetPerson(string name, int age)
        {
            var person = CreatePerson();
            person.Name = name;
            person.Age = age;
            return person;
        }

        public int Add(int x, int y)
        {
            return x + y;
        }

        public int SingleResultFailure(int x, int y)
        {
            throw new Exception("It didn't work!");
        }

        public int[] Batched(int count)
        {
            int[] result = new int[count];

            for(var i = 0; i < count; i++) {
                result[i] = i * i;
            }
            return result;
        }

        public ChannelReader<int> ObservableCounter(int count, int delay)
        {
            return Observable.Interval(TimeSpan.FromMilliseconds(delay)).Select((_, index) => index)
                .Take(count).AsChannelReader(new System.Threading.CancellationToken());
        }

        public int? NullableTest(int? value)
        {
            return value;
        }

        //https://github.com/aspnet/SignalR/blob/release/2.2/samples/SignalRSamples/Hubs/Streaming.cs
#pragma warning disable HAA0302 // Display class allocation to capture closure
#pragma warning disable HAA0301 // Closure Allocation Source
        public ChannelReader<int> ChannelCounter(int count, int delay)
        {
            var channel = Channel.CreateUnbounded<int>();
            Task.Run(async () => {
                for(var i = 0; i < count; i++) {
                    await channel.Writer.WriteAsync(i);
                    await Task.Delay(delay);
                }
                channel.Writer.TryComplete();
            });
            return channel.Reader;
        }

        public ChannelReader<Person> GetRandomPersons(int count, int delay)
        {
            var channel = Channel.CreateUnbounded<Person>();
            Task.Run(async () => {
                Random rand = new Random();

                for(var i = 0; i < count; i++) {
#pragma warning disable HAA0202 // Value type to reference type conversion allocation for string concatenation
                    await channel.Writer.WriteAsync(CreatePerson());
#pragma warning restore HAA0202 // Value type to reference type conversion allocation for string concatenation
                    await Task.Delay(delay);
                }
                await Clients.Client(Context.ConnectionId).SendAsync("Person", CreatePerson());
                channel.Writer.TryComplete();
            });
            return channel.Reader;
        }
#pragma warning restore HAA0301 // Closure Allocation Source
#pragma warning restore HAA0302 // Display class allocation to capture closure
    }
}
