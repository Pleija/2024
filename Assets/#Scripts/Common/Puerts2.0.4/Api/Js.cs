using System;
using Puerts;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;

public partial class Js
{
    static JsEnv _env;
    public static JsEnv self => isAlive ? _env : Init();
    public static bool isAlive => _env is { disposed: false };
    public static void Dispose() => _env?.Dispose();
    public static void Run(string code) => self.Eval(code);
    public static void Run(string code, object p1) => self.Eval<Action<object>>(code).Invoke(p1);
    public static void Run(string code, object p1, object p2) => self.Eval<Action<object, object>>(code).Invoke(p1, p2);

    public static void Run(string code, object p1, object p2, object p3) =>
        self.Eval<Action<object, object, object>>(code).Invoke(p1, p2, p3);

    public static void Run(string code, object p1, object p2, object p3, object p4) =>
        self.Eval<Action<object, object, object, object>>(code).Invoke(p1, p2, p3, p4);

    public static T Call<T>(string code) => self.Eval<Func<T>>(code).Invoke();
    public static TResult Call<TResult>(string code, object p1) => self.Eval<Func<object, TResult>>(code).Invoke(p1);

    public static TResult Call<TResult>(string code, object p1, object p2) =>
        self.Eval<Func<object, object, TResult>>(code).Invoke(p1, p2);

    public static TResult Call<TResult>(string code, object p1, object p2, object p3) =>
        self.Eval<Func<object, object, object, TResult>>(code).Invoke(p1, p2, p3);

    public static TResult Call<TResult>(string code, object p1, object p2, object p3, object p4) =>
        self.Eval<Func<object, object, object, object, TResult>>(code).Invoke(p1, p2, p3, p4);

    public static JSObject Require(string filename) => self.ExecuteModule(filename);
    public static T Require<T>(string filename, string export) => self.ExecuteModule<T>(filename, export);

    public static void Require(string filename, string export) =>
        self.ExecuteModule<Action>(filename, export)?.Invoke();

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
