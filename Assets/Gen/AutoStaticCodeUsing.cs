

namespace PuertsStaticWrap
{
    using System;
    using System.Linq;
    using System.Collections.Generic;
    using JsEnv = Puerts.JsEnv;
    using BindingFlags = System.Reflection.BindingFlags;

    public static class AutoStaticCodeUsing
    {
        public static void AutoUsing(this JsEnv jsEnv)
        {
            jsEnv.UsingAction<BestHTTP.Connections.HTTP2.HTTP2SettingsRegistry, BestHTTP.Connections.HTTP2.HTTP2Settings, System.UInt32, System.UInt32>();
            jsEnv.UsingAction<BestHTTP.Core.ConnectionEventInfo>();
            jsEnv.UsingAction<BestHTTP.Core.PluginEventInfo>();
            jsEnv.UsingAction<BestHTTP.Core.ProtocolEventInfo>();
            jsEnv.UsingAction<BestHTTP.Core.RequestEventInfo>();
            jsEnv.UsingAction<BestHTTP.HTTPRequest, System.Int64, System.Int64>();
            jsEnv.UsingAction<BestHTTP.PlatformSupport.Memory.BufferSegment, BestHTTP.PlatformSupport.Memory.BufferSegment>();
            jsEnv.UsingAction<BestHTTP.ServerSentEvents.EventSource, BestHTTP.ServerSentEvents.States, BestHTTP.ServerSentEvents.States>();
            jsEnv.UsingAction<BestHTTP.SignalR.Connection, BestHTTP.HTTPRequest, BestHTTP.SignalR.RequestTypes>();
            jsEnv.UsingAction<BestHTTP.SignalR.Connection, BestHTTP.SignalR.ConnectionStates, BestHTTP.SignalR.ConnectionStates>();
            jsEnv.UsingAction<BestHTTP.SignalR.Hubs.Hub, BestHTTP.SignalR.Messages.ClientMessage, BestHTTP.SignalR.Messages.FailureMessage>();
            jsEnv.UsingAction<BestHTTP.SignalR.Hubs.Hub, BestHTTP.SignalR.Messages.ClientMessage, BestHTTP.SignalR.Messages.ProgressMessage>();
            jsEnv.UsingAction<BestHTTP.SignalR.Hubs.Hub, BestHTTP.SignalR.Messages.ClientMessage, BestHTTP.SignalR.Messages.ResultMessage>();
            jsEnv.UsingAction<BestHTTP.SignalR.Transports.TransportBase, BestHTTP.SignalR.TransportStates, BestHTTP.SignalR.TransportStates>();
            jsEnv.UsingAction<BestHTTP.SignalRCore.HubConnection, BestHTTP.SignalRCore.ITransport, BestHTTP.SignalRCore.TransportEvents>();
            jsEnv.UsingAction<BestHTTP.SignalRCore.TransportStates, BestHTTP.SignalRCore.TransportStates>();
            jsEnv.UsingAction<BestHTTP.SocketIO3.Socket, BestHTTP.SocketIO3.IncomingPacket, System.Object[]>();
            jsEnv.UsingAction<BestHTTP.SocketIO3.SocketManager, BestHTTP.SocketIO3.IncomingPacket>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocket, BestHTTP.PlatformSupport.Memory.BufferSegment>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocket, BestHTTP.WebSocket.Frames.WebSocketFrameReader>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocket, System.UInt16, System.String>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocketResponse, BestHTTP.PlatformSupport.Memory.BufferSegment>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocketResponse, BestHTTP.WebSocket.Frames.WebSocketFrameReader>();
            jsEnv.UsingAction<BestHTTP.WebSocket.WebSocketResponse, System.UInt16, System.String>();
            jsEnv.UsingAction<NodeCanvas.BehaviourTrees.BehaviourTree, NodeCanvas.Framework.Status>();
            jsEnv.UsingAction<NodeCanvas.Framework.Status>();
            jsEnv.UsingAction<ParadoxNotion.EventData>();
            jsEnv.UsingAction<ParadoxNotion.EventData<System.Int32>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.Collider>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.Collider2D>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.Collision>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.Collision2D>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.ControllerColliderHit>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.EventSystems.AxisEventData>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.EventSystems.BaseEventData>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.EventSystems.PointerEventData>>();
            jsEnv.UsingAction<ParadoxNotion.EventData<UnityEngine.GameObject>>();
            jsEnv.UsingAction<Puerts.JsEnv, Puerts.ILoader, System.Int32>();
            jsEnv.UsingAction<System.Boolean>();
            jsEnv.UsingAction<System.Boolean, System.String>();
            jsEnv.UsingAction<System.Int32>();
            jsEnv.UsingAction<System.Int32, System.Boolean>();
            jsEnv.UsingAction<System.Int32, System.Threading.Tasks.ParallelLoopState>();
            jsEnv.UsingAction<System.Int32, UnityEngine.Rect>();
            jsEnv.UsingAction<System.Int32, UnityEngine.Vector2>();
            jsEnv.UsingAction<System.Int64>();
            jsEnv.UsingAction<System.Int64, System.Threading.Tasks.ParallelLoopState>();
            jsEnv.UsingAction<System.Object, System.Boolean>();
            jsEnv.UsingAction<System.Object, System.Int32>();
            jsEnv.UsingAction<System.Runtime.InteropServices.WindowsRuntime.EventRegistrationToken>();
            jsEnv.UsingAction<System.Single>();
            jsEnv.UsingAction<System.String, System.Boolean>();
            jsEnv.UsingAction<System.String, System.Boolean, System.String>();
            jsEnv.UsingAction<System.String, System.Boolean, UnityEngine.Profiling.Experimental.DebugScreenCapture>();
            jsEnv.UsingAction<System.String, System.String, UnityEngine.LogType>();
            jsEnv.UsingAction<System.String, UnityEngine.Rect>();
            jsEnv.UsingAction<UniRx.Diagnostics.LogEntry>();
            jsEnv.UsingAction<UniRx.Unit>();
            jsEnv.UsingAction<UnityEngine.CullingGroupEvent>();
            jsEnv.UsingAction<UnityEngine.CustomRenderTexture, System.Int32>();
            jsEnv.UsingAction<UnityEngine.Light[], Unity.Collections.NativeArray<UnityEngine.Experimental.GlobalIllumination.LightDataGI>>();
            jsEnv.UsingAction<UnityEngine.Rect, System.String>();
            jsEnv.UsingAction<UnityEngine.ReflectionProbe, UnityEngine.ReflectionProbe.ReflectionProbeEvent>();
            jsEnv.UsingAction<UnityEngine.Rendering.AsyncGPUReadbackRequest>();
            jsEnv.UsingAction<UnityEngine.Rendering.ScriptableRenderContext, UnityEngine.Camera>();
            jsEnv.UsingAction<UnityEngine.Rendering.ScriptableRenderContext, UnityEngine.Camera[]>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle, System.Exception>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle, UnityEngine.ResourceManagement.ResourceManager.DiagnosticEventType, System.Int32, System.Object>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle<UnityEngine.GameObject>>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle<UnityEngine.Object>>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle<UnityEngine.ResourceManagement.ResourceProviders.SceneInstance>>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle<UnityEngine.Texture>>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle<UnityEngine.Texture2D>>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.Diagnostics.DiagnosticEvent>();
            jsEnv.UsingAction<UnityEngine.ResourceManagement.ResourceManager.DiagnosticEventContext>();
            jsEnv.UsingAction<UnityEngine.SceneManagement.Scene>();
            jsEnv.UsingAction<UnityEngine.SceneManagement.Scene, System.Boolean>();
            jsEnv.UsingAction<UnityEngine.SceneManagement.Scene, System.String>();
            jsEnv.UsingAction<UnityEngine.SceneManagement.Scene, UnityEngine.SceneManagement.LoadSceneMode>();
            jsEnv.UsingAction<UnityEngine.SceneManagement.Scene, UnityEngine.SceneManagement.Scene>();
            jsEnv.UsingAction<UnityEngine.Scripting.GarbageCollector.Mode>();
            jsEnv.UsingAction<UnityEngine.Transform, UnityEngine.Transform, System.Boolean, System.Object[]>();
            //jsEnv.UsingAction<CardData, UnityEngine.Vector3, Placeable.Faction>();
            jsEnv.UsingFunc<BestHTTP.Connections.ConnectionBase, System.Boolean>();
            jsEnv.UsingFunc<BestHTTP.HTTPRequest, BestHTTP.HTTPResponse, System.Byte[], System.Int32, System.Boolean>();
            jsEnv.UsingFunc<BestHTTP.HTTPRequest, BestHTTP.HTTPResponse, System.Uri, System.Boolean>();
            jsEnv.UsingFunc<BestHTTP.HTTPRequest, System.Security.Cryptography.X509Certificates.X509Certificate, System.Security.Cryptography.X509Certificates.X509Chain, System.Net.Security.SslPolicyErrors, System.Boolean>();
            jsEnv.UsingFunc<BestHTTP.ServerSentEvents.EventSource, System.Boolean>();
            jsEnv.UsingFunc<BestHTTP.SignalRCore.HubConnection, BestHTTP.SignalRCore.Messages.Message, System.Boolean>();
            jsEnv.UsingFunc<Cysharp.Threading.Tasks.UniTask>();
            jsEnv.UsingFunc<Cysharp.Threading.Tasks.UniTaskVoid>();
            jsEnv.UsingFunc<ParadoxNotion.Services.Logger.Message, System.Boolean>();
            jsEnv.UsingFunc<System.Boolean>();
            jsEnv.UsingFunc<System.DateTime, System.Object, System.Boolean>();
            jsEnv.UsingFunc<System.Exception, System.Boolean>();
            jsEnv.UsingFunc<System.Int32>();
            jsEnv.UsingFunc<System.Int32, System.Boolean>();
            jsEnv.UsingFunc<System.Int32, System.Int32>();
            jsEnv.UsingFunc<System.Int32, System.Int32, System.Int32>();
            jsEnv.UsingFunc<System.Int32, System.String, TMPro.TMP_FontAsset>();
            jsEnv.UsingFunc<System.Int32, System.String, TMPro.TMP_SpriteAsset>();
            jsEnv.UsingFunc<System.IntPtr, System.IntPtr>();
            jsEnv.UsingFunc<System.Object, Cysharp.Threading.Tasks.UniTask>();
            jsEnv.UsingFunc<System.Reflection.Assembly, System.String, System.Boolean, System.Type>();
            jsEnv.UsingFunc<System.Reflection.FieldInfo, System.Boolean>();
            jsEnv.UsingFunc<System.Reflection.MemberInfo, System.Object, System.Boolean>();
            jsEnv.UsingFunc<System.Security.Claims.Claim, System.Boolean>();
            jsEnv.UsingFunc<System.Single>();
            jsEnv.UsingFunc<System.Single, System.Single>();
            jsEnv.UsingFunc<System.String, System.Boolean>();
            jsEnv.UsingFunc<System.String, System.Int32, System.Char, System.Char>();
            jsEnv.UsingFunc<System.String, System.Object, System.Boolean>();
            jsEnv.UsingFunc<System.String, System.String, System.Int32>();
            jsEnv.UsingFunc<System.String, UnityEngine.Color>();
            jsEnv.UsingFunc<System.Threading.CancellationToken, Cysharp.Threading.Tasks.UniTask>();
            jsEnv.UsingFunc<System.Threading.CancellationToken, Cysharp.Threading.Tasks.UniTaskVoid>();
            jsEnv.UsingFunc<System.Threading.CancellationToken, System.Collections.IEnumerator>();
            jsEnv.UsingFunc<System.Type, System.Object, System.Boolean>();
            jsEnv.UsingFunc<System.ValueTuple<System.Single, System.Single>>();
            jsEnv.UsingFunc<UniRx.Unit, System.IObservable<UniRx.Unit>>();
            jsEnv.UsingFunc<UnityEngine.GameObject, System.Boolean>();
            jsEnv.UsingFunc<UnityEngine.Rendering.BatchRendererGroup, UnityEngine.Rendering.BatchCullingContext, Unity.Jobs.JobHandle>();
            jsEnv.UsingFunc<UnityEngine.ResourceManagement.AsyncOperations.DownloadStatus>();
            jsEnv.UsingFunc<UnityEngine.UI.ILayoutElement, System.Single>();
        }
        
        public static void UsingAction(this JsEnv jsEnv, params Type[] types)
        {
            jsEnv.UsingGeneric(true, types);
        }
        public static void UsingFunc(this JsEnv jsEnv, params Type[] types)
        {
            jsEnv.UsingGeneric(false, types);
        }
        public static void UsingAction(this JsEnv jsEnv, params string[] args)
        {
            jsEnv.UsingGeneric(true, FindTypes(args));
        }
        public static void UsingFunc(this JsEnv jsEnv, params string[] args)
        {
            jsEnv.UsingGeneric(false, FindTypes(args));
        }
        public static void UsingGeneric(this JsEnv jsEnv, bool usingAction, params Type[] types)
        {
            var name = usingAction ? "UsingAction" : "UsingFunc";
            var count = types.Length;
            var method = (from m in typeof(JsEnv).GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                          where m.Name.Equals(name)
                             && m.IsGenericMethod
                             && m.GetGenericArguments().Length == count
                          select m).FirstOrDefault();
            if (method == null)
                throw new Exception("Not found method: '" + name + "', ArgsLength=" + count);
            method.MakeGenericMethod(types).Invoke(jsEnv, null);
        }
        static Type[] FindTypes(string[] args)
        {
            var assemblys = AppDomain.CurrentDomain.GetAssemblies();
            var types = new List<Type>();
            foreach (var arg in args)
            {
                Type type = null;
                for (var i = 0; i < assemblys.Length && type == null; i++)
                    type = assemblys[i].GetType(arg, false);
                if (type == null)
                    throw new Exception("Not found type: '" + arg + "'");
                types.Add(type);
            }
            return types.ToArray();
        }
    }
}