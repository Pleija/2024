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
import { iterator } from "Common/Iterator.mjs";
import List$1 = CS.System.Collections.Generic.List$1;
import GameObject = CS.UnityEngine.GameObject;
import Button = CS.UnityEngine.UI.Button;
import Dictionary$2 = CS.System.Collections.Generic.Dictionary$2;
import Array$1 = CS.System.Array$1;
import Int32 = CS.System.Int32;
import Single = CS.System.Single;

export const DevDebug = async function () {
    UnityApi.Log([{
        say: "hello, world",
        me: 1,
        test: {
            you: "love it", val: {
                ok: true
            }
        }
    }, {
        k: [111],
        other: "rich",
        money: 100,
    }]);
}

export const say = function (...args: any[]) {
    console.log(...args);

    let test = $typeof(String).CreateList() as any as List$1<string>;
    let t = $typeof(Type).CreateArray($typeof(Type));
    //let n = new array
    let dictionary = $typeof(String).CreateDictionary($typeof(Single)) as any as Dictionary$2<string, number>;
    let arr: Array$1<string> = [] as any;

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