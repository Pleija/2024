using System;
using System.Collections.Generic;
using System.IO;
using Puerts.ThirdParty;
using UnityEditor;
using UnityEngine;

namespace Puerts
{
    public partial class JsEnv
    {
        public static JsEnv _env;
        
        public static JsEnv self {
            get {
                if(_env == null || _env.disposed) {
                    _env = new JsEnv(new ResLoader());
                          CommonJS.InjectSupportForCJS(_env);
              _env.ExecuteModule("console-track.mjs");
                    _env.ExecuteModule("puerts-source-map-support.mjs");
                    // _env.ExecuteModule("puerts/cjsload.mjs");
                    // _env.ExecuteModule("puerts/modular.mjs");
                    _env.ExecuteModule("polyfill.mjs");
#if UNITY_EDITOR
                    if(!Application.isPlaying) {
                        EditorApplication.update -= Update;
                        EditorApplication.update += Update;
                        EditorApplication.playModeStateChanged += mode => {
                            _env?.Dispose();
                        };
                    }
#endif
                }
                return _env;
            }
        }

        public bool isDisposed => disposed;

        public static void Update()
        {
            if(_env is { disposed: false }) {
                _env.Tick();
            }
        }
    }
}
