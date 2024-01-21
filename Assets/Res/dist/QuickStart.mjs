//部署:npm run build
import './ExtensionDecl.mjs';
const { $ref, $unref, $generic, $promise, $typeof } = puer;
//静态函数
CS.UnityEngine.Debug.Log('hello world');
//对象构造
let obj = new CS.PuertsTest.DerivedClass();
//实例成员访问
obj.BMFunc(); //父类方法
obj.DMFunc(CS.PuertsTest.MyEnum.E1); //子类方法
console.log(obj.BMF, obj.DMF);
obj.BMF = 10; //父类属性
obj.DMF = 30; //子类属性
console.log(obj.BMF, obj.DMF);
//静态成员
console.log(CS.PuertsTest.BaseClass.BSF, CS.PuertsTest.DerivedClass.DSF, CS.PuertsTest.DerivedClass.BSF);
//委托，事件
//如果你后续不需要-=，可以像这样直接传函数当delegate
obj.MyCallback = msg => console.log("do not need remove, msg=" + msg);
//通过new构建的delegate，后续可以拿这个引用去-=
let delegate = new CS.PuertsTest.MyCallback(msg => console.log('can be removed, msg=' + msg));
//由于ts不支持操作符重载，Delegate.Combine相当于C#里头的obj.myCallback += delegate;
obj.MyCallback = CS.System.Delegate.Combine(obj.MyCallback, delegate);
obj.Trigger();
//Delegate.Remove相当于C#里头的obj.myCallback -= delegate;
obj.MyCallback = CS.System.Delegate.Remove(obj.MyCallback, delegate);
obj.Trigger();
//事件
obj.add_MyEvent(delegate);
obj.Trigger();
obj.remove_MyEvent(delegate);
obj.Trigger();
//静态事件
CS.PuertsTest.DerivedClass.add_MyStaticEvent(delegate);
obj.Trigger();
CS.PuertsTest.DerivedClass.remove_MyStaticEvent(delegate);
obj.Trigger();
//可变参数
obj.ParamsFunc(1024, 'haha', 'hehe', 'heihei');
//in out 参数
let p1 = $ref(1);
let p2 = $ref(10);
let ret = obj.InOutArgFunc(100, p1, p2);
obj.InOutArgFunc(100, p2, p2);
console.log('ret=' + ret + ', out=' + $unref(p1) + ', ref=' + $unref(p2));
//泛型
//先通过$generic实例化泛型参数
let List = $generic(CS.System.Collections.Generic.List$1, CS.System.Int32); //$generic调用性能不会太好，同样泛型参数建议整个工程，至少一个文件内只做一次
let Dictionary = $generic(CS.System.Collections.Generic.Dictionary$2, CS.System.String, List);
let lst = new List();
lst.Add(1);
lst.Add(0);
lst.Add(2);
lst.Add(4);
obj.PrintList(lst);
let dic = new Dictionary();
dic.Add("aaa", lst);
obj.PrintList(dic.get_Item("aaa"));
//arraybuffer
let ab = obj.GetAb(5);
let u8a0 = new Uint8Array(ab);
console.log(obj.SumOfAb(u8a0));
let u8a1 = new Uint8Array(2);
u8a1[0] = 123;
u8a1[1] = 101;
console.log(obj.SumOfAb(u8a1));
//引擎api
let go = new CS.UnityEngine.GameObject("testObject");
go.AddComponent($typeof(CS.UnityEngine.ParticleSystem));
go.transform.position = new CS.UnityEngine.Vector3(7, 8, 9);
//extension methods
obj.PlainExtension();
obj.Extension1();
obj.Extension2(go);
let obj1 = new CS.PuertsTest.BaseClass1();
obj.Extension2(obj1);
//typescript和c#的async，await联动，为了不在低版本的Unity下报错，先注释，c#7.3以上版本可以打开这些注释
async function asyncCall() {
    let task = obj.GetFileLength("Assets/Examples/05_Typescript/TsQuickStart.cs");
    let result = await $promise(task);
    console.log('file length is ' + result);
    let task2 = obj.GetFileLength("notexistedfile"); //这个会抛文件找不到异常，被catch
    let result2 = await $promise(task2);
    console.log('file length is ,' + result2);
}
asyncCall().catch(e => console.error("catch:" + e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVpY2tTdGFydC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1F1aWNrU3RhcnQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtCQUFrQjtBQUVsQixPQUFPLHFCQUFxQixDQUFBO0FBRTVCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRTNELE1BQU07QUFDTixFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFeEMsTUFBTTtBQUNOLElBQUksR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUUzQyxRQUFRO0FBQ1IsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUEsTUFBTTtBQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEsTUFBTTtBQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUEsTUFBTTtBQUNuQixHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFBLE1BQU07QUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUU5QixNQUFNO0FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxD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