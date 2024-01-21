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

    public static void Call(string code, params object[] args)
    {
        //@formatter:off
        switch (args.Length) {
            case 0: self.Eval(code); break;
            case 1: self.Eval<Action<object>>(code).Invoke(args[0]); break;
            case 2: self.Eval<Action<object,object>>(code).Invoke(args[0],args[1]); break;
            case 3: self.Eval<Action<object,object,object>>(code).Invoke(args[0],args[1],args[3]); break;
            case 4: self.Eval<Action<object,object,object,object>>(code).Invoke(args[0],args[1],args[3],args[4]); break;
            default: throw new Exception("Parameters max is 4");
        }
        //@formatter:on
    }

    public static T Call<T>(string code, params object[] args)
    {
        //@formatter:off
        switch (args.Length) {
           case 0: return self.Eval<Func<T>>(code).Invoke();
           case 1: return self.Eval<Func<object,T>>(code).Invoke(args[0]);
           case 2: return self.Eval<Func<object,object,T>>(code).Invoke(args[0],args[1]);
           case 3: return self.Eval<Func<object,object,object,T>>(code).Invoke(args[0],args[1],args[2]);
           case 4: return self.Eval<Func<object,object,object,object,T>>(code).Invoke(args[0],args[1],args[2],args[3]);
           default: throw new Exception("Parameters max is 4");
        }
        //@formatter:on       
    }

    public static JSObject Require(string file) => self.ExecuteModule(file);

    public static T Require<T>(string file, string export, params object[] args)
    {
        //@formatter:off
        switch (args.Length) {
           case 0: return self.ExecuteModule<T>(file, export);
           case 1: return self.ExecuteModule<Func<object,T>>(file, export).Invoke(args[0]);
           case 2: return self.ExecuteModule<Func<object,object,T>>(file, export).Invoke(args[0],args[1]);
           case 3: return self.ExecuteModule<Func<object,object,object,T>>(file, export).Invoke(args[0],args[1],args[2]);
           case 4: return self.ExecuteModule<Func<object,object,object,object,T>>(file, export).Invoke(args[0],args[1],args[2],args[3]);
           default: throw new Exception("Parameters max is 4");
        }
        //@formatter:on      
    }

    public static void Require(string file, string export, params object[] args)
    {
        //@formatter:off
        switch (args.Length) {
            case 0: self.ExecuteModule<Action>(file,export).Invoke(); break;
            case 1: self.ExecuteModule<Action<object>>(file, export).Invoke(args[0]); break;
            case 2: self.ExecuteModule<Action<object,object>>(file, export).Invoke(args[0],args[1]); break;
            case 3: self.ExecuteModule<Action<object,object,object>>(file, export).Invoke(args[0],args[1],args[3]); break;
            case 4: self.ExecuteModule<Action<object,object,object,object>>(file, export).Invoke(args[0],args[1],args[3],args[4]); break;
            default: throw new Exception("Parameters max is 4");
        }
        //@formatter:on       
    }

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
                if (mode == PlayModeStateChange.ExitingEditMode || mode == PlayModeStateChange.ExitingPlayMode)
                    Dispose();
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

#if UNITY_EDITOR
    public static void EditorUpdate() => Tick();
    [InitializeOnEnterPlayMode]
    static void OnRun() => Dispose();
#endif
}
