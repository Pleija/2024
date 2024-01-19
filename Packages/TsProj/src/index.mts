import GameObject = CS.UnityEngine.GameObject;
import UnityApi = CS.UnityApi;
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;

console.log("demo 123");

const go = GameObject.Find("test");
go.Children().AsWhere(t => true ).AsForEach(x => {
    console.log(x.Get(Button).name);
});
//go.Children();
