#region
using Puerts;
#endregion

public class CommonJS
{
    public static void InjectSupportForCJS(JsEnv env)
    {
        env.ExecuteModule("puer-commonjs/load.mjs");
        env.ExecuteModule("puer-commonjs/modular.mjs");
    }
}
