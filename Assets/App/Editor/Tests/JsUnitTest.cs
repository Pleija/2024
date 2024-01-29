#region
using Newtonsoft.Json;
using NUnit.Framework;
using Puerts;
using UnityEngine;
#endregion

namespace Tests
{
    [TestFixture]
    public class JsUnitTest
    {
        [Test]
        public static void TestJsRun()
        {
            var len = JsEnv.self.Eval<JSObject>("[1,2,3,4]").Get<int>("[1]");
            Debug.Log(len);
            //test.ForEach()
            //test.ForEach();
        }

        [Test]
        public static void TestTsDb()
        {
            JsEnv.Reload().Require("dbtest", "orm");
        }

        [Test]
        public static void CheckType()
        {
            JsEnv.Reload().Require("debug", "checkType");
        }

        [Test]
        public static void TestJson()
        {
            Debug.Log(JsonConvert.SerializeObject("test"));
        }
    }
}
