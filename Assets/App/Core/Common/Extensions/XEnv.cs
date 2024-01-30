using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Puerts;
using UnityEditor;
using UnityEngine;

namespace Extensions
{
    public static class XEnv
    {
        public static void XWaitDebugger(this JsEnv jsEnv) {
            return;

            Debug.Log("<color=red>Wait Debugger...</color>");
            #if UNITY_EDITOR
            EditorUtility.DisplayProgressBar("Wait Debugger", "Connecting Debugger...", 0);
            #endif
            jsEnv.Eval("require('inspector').waitForDebugger()");
            #if UNITY_EDITOR

            //EditorUtility.ClearProgressBar();
            #endif
        }

        public static bool Alive(this JsEnv jsEnv) {
            return jsEnv != null && jsEnv.isolate != IntPtr.Zero;
        }

        public static void DisposeAll() {
            for (var i = 0; i < JsEnv.jsEnvs.Count; i++)
                if (JsEnv.jsEnvs[i] != null && !JsEnv.jsEnvs[i].Disposed()) {
                    JsEnv.jsEnvs[i].Dispose();
                    JsEnv.jsEnvs[i] = null;
                }

            JsEnv.jsEnvs.RemoveAll(t => t == null);
        }

        public static bool Disposed(this JsEnv jsEnv) {
            return jsEnv == null || jsEnv.isolate == IntPtr.Zero;
        }

        public static Type[] FindTypes(params string[] args) {
            var assemblys = AppDomain.CurrentDomain.GetAssemblies();
            var types = new List<Type>();
            foreach (var arg in args) {
                Type type = null;
                for (var i = 0; i < assemblys.Length && type == null; i++) type = assemblys[i].GetType(arg, false);

                if (type == null) throw new Exception("Not found type: '" + arg + "'");

                types.Add(type);
            }

            return types.ToArray();
        }

        public static bool CheckDebugger(this JsEnv jsEnv) {
            return PuertsDLL.InspectorTick(jsEnv.isolate);
        }

        public static void XWaitDebuggerTimeout(this JsEnv jsEnv, int timeout = 5) {
            var time = Time.realtimeSinceStartup;
            while (!PuertsDLL.InspectorTick(jsEnv.isolate))
                if (Time.realtimeSinceStartup - time >= timeout) {
                    #if UNITY_EDITOR
                    var ret = EditorUtility.DisplayDialog("Connect Debugger", $"调试器未连接, 等待 {timeout}s?", "是", "不调试");

                    if (ret)
                        time = Time.realtimeSinceStartup;
                    else
                        break;
                    #endif
                }
        }

        public static JsEnv XAutoUsing(this JsEnv jsEnv) {
            var method = FindTypes("PuertsStaticWrap.AutoStaticCodeUsing").FirstOrDefault()
                ?.GetMethod("AutoUsing", BindingFlags.Static | BindingFlags.Public);

            method?.Invoke(null, new object[] { jsEnv });
            return jsEnv;
        }
    }
}
