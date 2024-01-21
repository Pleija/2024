using System;
using Puerts;
using UnityEditor;
using UnityEngine;
using WebSocketSharp;

public partial class Js
{
    static JsEnv _env;
    public static JsEnv self => isAlive ? _env : Init();
    public static bool isAlive => _env is { disposed: false };
    public static void Dispose() => _env?.Dispose();
    public static void Run(string code) => self.Eval(code);
    public static void Run<T>(string code, T p1) => self.Eval<Action<T>>(code).Invoke(p1);
    public static void Run<T1, T2>(string code, T1 p1, T2 p2) => self.Eval<Action<T1, T2>>(code).Invoke(p1, p2);

    public static void Run<T1, T2, T3>(string code, T1 p1, T2 p2, T3 p3) =>
        self.Eval<Action<T1, T2, T3>>(code).Invoke(p1, p2, p3);

    public static void Run<T1, T2, T3, T4>(string code, T1 p1, T2 p2, T3 p3, T4 p4) =>
        self.Eval<Action<T1, T2, T3, T4>>(code).Invoke(p1, p2, p3, p4);

    public static void Call<T>(string code) => self.Eval<Func<T>>(code).Invoke();
    public static TResult Call<T1, TResult>(string code, T1 p1) => self.Eval<Func<T1, TResult>>(code).Invoke(p1);

    public static TResult Call<T1, T2, TResult>(string code, T1 p1, T2 p2) =>
        self.Eval<Func<T1, T2, TResult>>(code).Invoke(p1, p2);

    public static TResult Call<T1, T2, T3, TResult>(string code, T1 p1, T2 p2, T3 p3) =>
        self.Eval<Func<T1, T2, T3, TResult>>(code).Invoke(p1, p2, p3);

    public static TResult Call<T1, T2, T3, T4, TResult>(string code, T1 p1, T2 p2, T3 p3, T4 p4) =>
        self.Eval<Func<T1, T2, T3, T4, TResult>>(code).Invoke(p1, p2, p3, p4);

    public static JSObject Require(string filename, string export = "") => export.IsNullOrEmpty()
        ? self.ExecuteModule(filename) : self.ExecuteModule<JSObject>(filename, export);

    public static T Require<T>(string filename, string export) => self.ExecuteModule<T>(filename, export);

    public static void Tick()
    {
        if (isAlive) _env.Tick();
    }

    static JsEnv Init()
    {
        _env = new JsEnv(new ResLoader());
        CommonJS.InjectSupportForCJS(_env);
        _env.ExecuteModule("console-track.mjs");
        _env.ExecuteModule("puerts-source-map-support.mjs");
        // _env.ExecuteModule("puerts/cjsload.mjs");
        // _env.ExecuteModule("puerts/modular.mjs");
        _env.ExecuteModule("polyfill.mjs");
#if UNITY_EDITOR
        if (!Application.isPlaying) {
            EditorApplication.update -= EditorUpdate;
            EditorApplication.update += EditorUpdate;
            EditorApplication.playModeStateChanged += mode => {
                _env?.Dispose();
            };
        }
#endif
        //JsMain.self.Reload();
        JsMain.AutoBind?.Invoke(_env);
        //_env.UsingAction<Action, Action<string>>();
        var action = _env.ExecuteModule<Action>("bootstrap.mjs", "setup");
        if (Application.isPlaying) action.Invoke();
        return _env;
    }

    public static JsEnv Reload()
    {
        Dispose();
        return self;
    }

    public static void EditorUpdate() => Tick();
#if UNITY_EDITOR
    [InitializeOnEnterPlayMode]
    static void OnRun() => Dispose();
#endif
}
