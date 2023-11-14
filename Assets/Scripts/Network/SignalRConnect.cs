using System;
using BestHTTP.SignalRCore;
using BestHTTP.SignalRCore.Encoders;
using Common;
using UnityEngine;
using UnityEngine.Serialization;

namespace Network
{
    public class SignalRConnect : Agent<SignalRConnect>
    {
        public IProtocol protocol { get; set; }
        public HubConnection Hub { get; set; }
        public string path = "/TestHub";
        public string BaseURL = "http://192.168.1.65:5000";
        public bool autoStart;

        private void OnDestroy()
        {
            Hub?.StartClose();
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

        public void Connect()
        {
            protocol = new MessagePackProtocol() /*new LitJsonEncoder()*/;
            Hub = new HubConnection(new Uri(BaseURL + path), protocol);
            Hub.OnConnected += Hub_OnConnected;
            Hub.OnError += Hub_OnError;
            Hub.OnClosed += Hub_OnClosed;
            Hub.OnTransportEvent += (hub, transport, ev) => AddText(
                $"Transport(<color=green>{transport.TransportType}</color>) event: <color=green>{ev}</color>");
            // Set up server callable functions
            Hub.On("Send",
                (string arg) =>
                    AddText($"On '<color=green>Send</color>': '<color=yellow>{arg}</color>'"));
            Hub.On<Person>("Person",
                (person) =>
                    AddText($"On '<color=green>Person</color>': '<color=yellow>{person}</color>'"));
            Hub.On<Person, Person>("TwoPersons",
                (person1, person2) => AddText(
                    $"On '<color=green>TwoPersons</color>': '<color=yellow>{person1}</color>', '<color=yellow>{person2}</color>'"));
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
