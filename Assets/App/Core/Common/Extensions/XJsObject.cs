using System;
using System.Linq;
using System.Text.RegularExpressions;
using Puerts;
using UnityEngine;

namespace Extensions
{
    public static class XJsObject
    {
        //
        static void TestParseJsObj() {
            var jsObject = JsEnv.self.Eval<JSObject>("any".ToCode());
            jsObject.Get<(string name, int age, Func<string> fn)>(t => {
                Debug.Log(t.age);
            });

            "require('HelloWorld')".ToCode().Get<string>(t => { });
        }

        public static T Get<T>(this JSObject jsObject, Action<T> action = null) {
            /*
             jsObject.Get<(string name, int age, Func<string> fn)>(t => {
                Debug.Log(t.age);
            });
             */
            if (typeof(Tuple).IsAssignableFrom(typeof(T))) {
                // https://stackoverflow.com/questions/59498210/getting-the-value-of-a-tuple-using-reflection
                var result = typeof(T).GetProperties().Where(prop => prop.CanRead)
                    .Where(prop => !prop.GetIndexParameters().Any())
                    .Where(prop => !Regex.IsMatch(prop.Name, "^Item[0-9]+$")).ToDictionary(prop => prop.Name,
                        prop => JsEnv.self.Eval<Func<JSObject, string, object>>("(o,c) => o[c]")
                            .Invoke(jsObject, prop.Name));

                Debug.Log(result.Keys.JoinStr());

                // https://stackoverflow.com/questions/47420951/c-sharp-construct-a-default-object-for-a-tuple-by-reflection
                var fieldInfoArray = typeof(T).GetFields();
                var values = result.Values.ToArray(); //fieldInfoArray.Select(t => result[t.Name])
                var typeArguments = fieldInfoArray.Select(fieldInfo => fieldInfo.FieldType).ToArray();
                return (T) typeof(Tuple).GetMethods()
                    .FirstOrDefault(method =>
                        method.Name == "Create" && method.GetParameters().Length == typeArguments.Length)
                    ?.MakeGenericMethod(typeArguments)?.Invoke(null, values);
            }

            return JsEnv.self.Eval<Func<JSObject, T>>("obj => obj".ToCode()).Invoke(jsObject);
        }

        public static T Get<T>(this string script, Action<T> action = null) {
            /*
           "require('HelloWorld')".Get<string>(t => {

            });
             */
            var ret = JsEnv.self.Eval<T>(script.ToCode());
            action?.Invoke(ret);
            return ret;
        }

        public static string GetName(this JSObject jsObject) {
            return JsEnv.self.Eval<Func<JSObject, string>>("o => o?.name".ToCode())?.Invoke(jsObject);
        }

        public static void CallJsFunc<T>(this JSObject jsObject, string fn, T T1) {
            JsEnv.self.Eval<Action<JSObject, string, T>>("(o,fn,...args) => o[fn]?.apply(o,...args)".ToCode())
                ?.Invoke(jsObject, fn, T1);
        }
    }
}
