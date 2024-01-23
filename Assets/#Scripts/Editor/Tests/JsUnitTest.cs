using System.Collections.Generic;
using Newtonsoft.Json;
using NUnit.Framework;
using Puerts;
using Sirenix.Utilities;
using UnityEngine;

namespace Tests
{
    [TestFixture]
    public class JsUnitTest
    {
 
        [Test]
        public static void TestJsRun()
        {
          var len =  Js.self.Eval<JSObject>("[1,2,3,4]").Get<int>("[1]");
            Debug.Log(len);
            //test.ForEach()
            //test.ForEach();
        }

        [Test]
        public static void TestJson()
        {
           Debug.Log(JsonConvert.SerializeObject("test"));
        }
    }
}
