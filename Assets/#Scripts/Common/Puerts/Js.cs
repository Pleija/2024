using System;
using Puerts;
using UnityEditor;
using UnityEngine;

public partial class Js
{
    public static JsEnv _env;

    public static JsEnv Env {
        get {
            if (_env is { disposed: false }) return _env;
            Init();
            return _env;
        }
    }

    static void Init()
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
        _env.ExecuteModule<Action>("bootstrap.mjs", "setup")?.Invoke();
    }

    public static void Reload()
    {
        _env?.Dispose();
        Init();
    }
    //public bool isDisposed => _env.disposed;

    public static void EditorUpdate()
    {
        if (_env is { disposed: false }) {
            _env.Tick();
        }
    }
}
