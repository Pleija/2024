import GameObject = CS.UnityEngine.GameObject;
import UnityApi = CS.UnityApi;
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;
import String = CS.System.String;
import List$1 = CS.System.Collections.Generic.List$1;

console.log("demo 123");

const go = GameObject.Find("test");
go.Children().AsWhere(t => true ).AsForEach(x => {
    console.log(x.Get(Button));
    (new GameObject(""))
});