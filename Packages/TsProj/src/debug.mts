import HubConnection = CS.BestHTTP.SignalRCore.HubConnection;
import MessagePackProtocol = CS.BestHTTP.SignalRCore.Encoders.MessagePackProtocol;
import Uri = CS.System.Uri;
import $promise = puer.$promise;
import UnityApi = CS.UnityApi;
import Person = CS.Api.Person;
import String = CS.System.String;
import Array = CS.System.Array;
import $typeof = puer.$typeof;
import Type = CS.System.Type;
import Array$1 = CS.System.Array$1;
import { iterator } from "Common/Iterator.mjs";

export const DevDebug = async function () {
    UnityApi.Log({
        say: "hello, world", me: 1, test: {
            you: "love it", val: {
                ok: true
            }
        }
    });
}

export const say = function (...args: any[]) {
    console.log(...args);
}

export const network = async function (...args: any[]) {
    const url = "http://192.168.1.65:5000/";
    const protocol = new MessagePackProtocol();
    console.log(url);
    const hub = new HubConnection(new Uri(url), protocol);
    
    hub.On("Send", $typeof(Type).CreateArray($typeof(String)), (msg: Array$1<any>) => {
        iterator(msg).forEach(t => console.log(t));
    });
    
    hub.On("Person", $typeof(Type).CreateArray($typeof(Person)), (msg: Array$1<any>) => {
        iterator(msg).forEach(t => console.log(t));
    });
    
    hub.On("TwoPersons", $typeof(Type).CreateArray($typeof(Person), $typeof(Person)), (msg: Array$1<any>) => {
        iterator(msg).forEach(t => console.log(t));
    });


    await $promise(hub.ConnectAsync());
    await $promise(hub.SendAsync("Send", "my message"));
}