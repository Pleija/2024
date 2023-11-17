using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using Api;
using BestHTTP;
using BestHTTP.SignalRCore;
using BestHTTP.SignalRCore.Encoders;
using Common;
using MessagePack;
using Sirenix.Utilities;
using UnityEngine;
using UnityEngine.Serialization;

namespace Network
{
    public class Client : Singleton<Client>, IAutoCreate, IDontDestroyOnLoad
    {
        public IProtocol protocol { get; set; }
        private HubConnection m_Hub;

        public HubConnection Hub {
            get {
                if(m_Hub == null) Connect();
                return m_Hub;
            }
            set => m_Hub = value;
        }

        public string path => "/";
        public string BaseURL = "http://192.168.1.65:5000";
        public string ServerURL = "http://43.163.239.131:5000";
        public bool autoStart;
        public static int index { get; set; }
        public void UseServer(GameObject target) { }

        public static void Call<TRequest, TResult>(CallType id, Func<TRequest, TRequest> request,
            Action<TRequest, TResult> result)
        {
            var req = request.Invoke(Activator.CreateInstance<TRequest>());
            var data = XJson.Encrypt(MessagePackSerializer.Serialize(req));
            var key = index += 1;
            self.Hub.Invoke<byte[]>("Q", id,
                XJson.Encrypt(MessagePackSerializer.Serialize(key), data.MD5()), data).OnSuccess(
                t => {
                    var x = XJson.Decrypt(t, data.MD5(key));
                    var ret = MessagePackSerializer.Deserialize<TResult>( x);
                    result.Invoke(req, ret);
                }).OnError(Debug.Log);
        }

        public static void Reg()
        {
            Call<long, long>(CallType.GetTimestamp, r => DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                (r, t) => { });
        }

        protected override void OnDestroy()
        {
            Hub?.StartClose();
            base.OnDestroy();
        }

        public void AddText(string log)
        {
            Debug.Log(log);
        }

        /// <summary>
        ///     This is called when the hub is closed after a StartClose() call.
        /// </summary>
        private void Hub_OnClosed(HubConnection hub)
        {
            //SetButtons(true, false);
            AddText("Hub Closed");
        }

        /// <summary>
        ///     Called when an unrecoverable error happen. After this event the hub will not send or receive
        ///     any messages.
        /// </summary>
        private void Hub_OnError(HubConnection hub, string error)
        {
            //SetButtons(true, false);
            AddText($"Hub Error: <color=red>{error}</color>");
        }

        private void Start()
        {
            if(autoStart) {
                Connect();
            }
        }

        public override void Update()
        {
            base.Update();
            //
            // if(m_Hub is { State: ConnectionStates.Connected }) {
            //     HTTPManager.OnUpdate();
            // }
        }

        public Dictionary<Type, object> instances = new Dictionary<Type, object>();
        public bool testSample;

        public void Connect()
        {
            protocol = new MessagePackProtocol() /*new LitJsonEncoder()*/;
            var option = new HubOptions {
                PingInterval = TimeSpan.Zero, //TimeSpan.FromMinutes(5),
            };
            Hub = new HubConnection(new Uri(BaseURL + path), protocol, option);
            if(testSample)
                Hub.OnConnected += Hub_OnConnected;
            Hub.OnError += Hub_OnError;
            Hub.OnClosed += Hub_OnClosed;
            Hub.OnTransportEvent += (hub, transport, ev) => AddText(
                $"Transport(<color=green>{transport.TransportType}</color>) event: <color=green>{ev}</color>");
            GetType().Assembly.ExportedTypes
                .Where(type => typeof(INetService).IsAssignableFrom(type)).SelectMany(type =>
                    type.GetMethods(BindingFlags.Public | BindingFlags.Instance)).ForEach(info => {
                    var instance = instances.TryGetValue(info.DeclaringType!, out var ret) ? ret
                        : instances[info.DeclaringType] =
                            Activator.CreateInstance(info.DeclaringType);
                    var paramTypes = info.GetParameters().Length > 0 ? info.GetParameters()
                        .Select(x => x.ParameterType).ToArray() : null;

                    if(info.ReturnType == typeof(void)) {
                        Hub.On(info.Name, paramTypes, args => info.Invoke(instance, args));
                        return;
                    }
                    Hub.OnFunc(info.ReturnType, info.Name, paramTypes,
                        args => info.Invoke(instance, args));
                });
            //
            // // Set up server callable functions
            // Hub.On("Send",
            //     (string arg) =>
            //         AddText($"On '<color=green>Send</color>': '<color=yellow>{arg}</color>'"));
            // Hub.On<Person>("Person",
            //     (person) =>
            //         AddText($"On '<color=green>Person</color>': '<color=yellow>{person}</color>'"));
            // Hub.On<Person, Person>("TwoPersons",
            //     (person1, person2) => AddText(
            //         $"On '<color=green>TwoPersons</color>': '<color=yellow>{person1}</color>', '<color=yellow>{person2}</color>'"));
            // And finally start to connect to the server
            Hub.StartConnect();
            AddText("StartConnect called");
        }

        /// <summary>
        ///     This callback is called when the plugin is connected to the server successfully. Messages can
        ///     be sent to the server after this point.
        /// </summary>
        private void Hub_OnConnected(HubConnection hub)
        {
            //SetButtons(false, true);
            AddText(string.Format(
                "Hub Connected with <color=green>{0}</color> transport using the <color=green>{1}</color> encoder.",
                hub.Transport.TransportType.ToString(), hub.Protocol.Name));
            hub.Send("SendMetadata", new Metadata() {
                intData = 123,
                strData = "meta data",
                myEnum = MyEnum.One,
            });

            // Call a server function with a string param. We expect no return value.
            hub.Send("Send", "my message");

            // Call a parameterless function. We expect a string return value.
            hub.Invoke<string>("NoParam")
                .OnSuccess(ret =>
                    AddText(string.Format(
                        "'<color=green>NoParam</color>' returned: '<color=yellow>{0}</color>'",
                        ret))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>NoParam</color>' error: '<color=red>{0}</color>'", error)));

            // Call a function on the server to add two numbers. OnSuccess will be called with the result and OnError if there's an error.
            hub.Invoke<int>("Add", 10, 20)
                .OnSuccess(result =>
                    AddText(string.Format(
                        "'<color=green>Add(10, 20)</color>' returned: '<color=yellow>{0}</color>'",
                        result))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>Add(10, 20)</color>' error: '<color=red>{0}</color>'",
                        error)));
            hub.Invoke<int?>("NullableTest", 10)
                .OnSuccess(result =>
                    AddText(string.Format(
                        "'<color=green>NullableTest(10)</color>' returned: '<color=yellow>{0}</color>'",
                        result))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>NullableTest(10)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // Call a function that will return a Person object constructed from the function's parameters.
            hub.Invoke<Person>("GetPerson", "Mr. Smith", 26)
                .OnSuccess(result =>
                    AddText(string.Format(
                        "'<color=green>GetPerson(\"Mr. Smith\", 26)</color>' returned: '<color=yellow>{0}</color>'",
                        result))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>GetPerson(\"Mr. Smith\", 26)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // To test errors/exceptions this call always throws an exception on the server side resulting in an OnError call.
            // OnError expected here!
            hub.Invoke<int>("SingleResultFailure", 10, 20)
                .OnSuccess(result =>
                    AddText(string.Format(
                        "'<color=green>SingleResultFailure(10, 20)</color>' returned: '<color=yellow>{0}</color>'",
                        result))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>SingleResultFailure(10, 20)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // This call demonstrates IEnumerable<> functions, result will be the yielded numbers.
            hub.Invoke<int[]>("Batched", 10)
                .OnSuccess(result =>
                    AddText(string.Format(
                        "'<color=green>Batched(10)</color>' returned items: '<color=yellow>{0}</color>'",
                        result.Length))).OnError(error =>
                    AddText(string.Format(
                        "'<color=green>Batched(10)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // OnItem is called for a streaming request for every items returned by the server. OnSuccess will still be called with all the items.
            hub.GetDownStreamController<int>("ObservableCounter", 10, 1000)
                .OnItem(result =>
                    AddText(string.Format(
                        "'<color=green>ObservableCounter(10, 1000)</color>' OnItem: '<color=yellow>{0}</color>'",
                        result)))
                .OnSuccess(result =>
                    AddText("'<color=green>ObservableCounter(10, 1000)</color>' OnSuccess."))
                .OnError(error =>
                    AddText(string.Format(
                        "'<color=green>ObservableCounter(10, 1000)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // A stream request can be cancelled any time.
            var controller = hub.GetDownStreamController<int>("ChannelCounter", 10, 1000);
            controller
                .OnItem(result =>
                    AddText(string.Format(
                        "'<color=green>ChannelCounter(10, 1000)</color>' OnItem: '<color=yellow>{0}</color>'",
                        result)))
                .OnSuccess(result =>
                    AddText("'<color=green>ChannelCounter(10, 1000)</color>' OnSuccess.")).OnError(
                    error => AddText(string.Format(
                        "'<color=green>ChannelCounter(10, 1000)</color>' error: '<color=red>{0}</color>'",
                        error)));

            // a stream can be cancelled by calling the controller's Cancel method
            controller.Cancel();

            // This call will stream strongly typed objects
            hub.GetDownStreamController<Person>("GetRandomPersons", 20, 2000).OnItem(result =>
                AddText(string.Format(
                    "'<color=green>GetRandomPersons(20, 1000)</color>' OnItem: '<color=yellow>{0}</color>'",
                    result))).OnSuccess(result =>
                AddText("'<color=green>GetRandomPersons(20, 1000)</color>' OnSuccess."));
        }
    }
}
