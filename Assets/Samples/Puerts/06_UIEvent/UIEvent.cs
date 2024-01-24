using System;
using UnityEngine;
using Puerts;

public class UIEvent : MonoBehaviour
{
    static Puerts.JsEnv jsEnv;

    void Start()
    {
        if (jsEnv == null)
        {
            jsEnv = new Puerts.JsEnv();
            jsEnv.UsingAction<bool>();//toggle.onValueChanged用到
        }

        var init = jsEnv.ExecuteModule<Action<MonoBehaviour>>("UIEvent.mjs", "init");

        if (init != null) init(this);
    }
}
