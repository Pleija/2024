#region
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Debug = UnityEngine.Debug;
using Object = UnityEngine.Object;
#endregion

namespace ParadoxNotion.Services
{
    ///<summary>A custom logger</summary>
    public static class Logger
    {
        public delegate bool LogHandler(Message message);
        private static List<LogHandler> subscribers = new List<LogHandler>();
        public static bool enabled = true;

        ///----------------------------------------------------------------------------------------------
        ///<summary>Subscribe a listener to the logger</summary>
        public static void AddListener(LogHandler callback)
        {
            subscribers.Add(callback);
        }

        ///<summary>Remove a listener from the logger</summary>
        public static void RemoveListener(LogHandler callback)
        {
            subscribers.Remove(callback);
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Log Info</summary>
        [Conditional("DEVELOPMENT_BUILD"), Conditional("UNITY_EDITOR")]
        public static void Log(object message, string tag = null, object context = null)
        {
            Internal_Log(LogType.Log, message, tag, context);
        }

        ///<summary>Log Warning</summary>
        [Conditional("DEVELOPMENT_BUILD"), Conditional("UNITY_EDITOR")]
        public static void LogWarning(object message, string tag = null, object context = null)
        {
            Internal_Log(LogType.Warning, message, tag, context);
        }

        ///<summary>Log Error</summary>
        [Conditional("DEVELOPMENT_BUILD"), Conditional("UNITY_EDITOR")]
        public static void LogError(object message, string tag = null, object context = null)
        {
            Internal_Log(LogType.Error, message, tag, context);
        }

        ///<summary>Log Exception</summary>
        public static void LogException(Exception exception, string tag = null,
            object context = null)
        {
            Internal_Log(LogType.Exception, exception, tag, context);
        }

        ///----------------------------------------------------------------------------------------------

        //...
        private static void Internal_Log(LogType type, object message, string tag, object context)
        {
            if (!enabled) return;

            if (subscribers != null && subscribers.Count > 0) {
                var msg = new Message();
                msg.type = type;

                if (message is Exception) {
                    var exc = (Exception)message;
                    msg.text = exc.Message + "\n" + exc.StackTrace.Split('\n').FirstOrDefault();
                }
                else {
                    msg.text = message != null ? message.ToString() : "NULL";
                }
                msg.tag = tag;
                msg.context = context;
                var handled = false;

                foreach (var call in subscribers)
                    if (call(msg)) {
                        handled = true;
                        break;
                    }

                //if log is handled, don't forward to unity console unless its an exception
                if (handled && type != LogType.Exception) return;
            }
            if (!string.IsNullOrEmpty(tag))
                tag = string.Format("<b>({0} {1})</b>", tag, type.ToString());
            else
                tag = string.Format("<b>({0})</b>", type.ToString());
#if UNITY_EDITOR
            if (!Threader.isMainThread) {
                EditorApplication.delayCall += () => {
                    ForwardToUnity(type, message, tag, context);
                };
                return;
            }
#endif
            ForwardToUnity(type, message, tag, context);
        }

        //forward the log to unity console
        private static void ForwardToUnity(LogType type, object message, string tag, object context)
        {
            if (message is Exception)
                Debug.unityLogger.LogException((Exception)message);
            else
                Debug.unityLogger.Log(type, tag, message, context as Object);
        }

        ///<summary>A message that is logged</summary>
        public struct Message
        {
            private WeakReference<object> _contextRef;

            public object context {
                get {
                    object reference = null;
                    if (_contextRef != null) _contextRef.TryGetTarget(out reference);
                    return reference;
                }
                set => _contextRef = new WeakReference<object>(value);
            }

            public LogType type;
            public string text;
            public string tag;
            public bool IsValid() => !string.IsNullOrEmpty(text);
        }
    }
}
