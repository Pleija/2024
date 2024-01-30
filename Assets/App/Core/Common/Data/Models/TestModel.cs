using System.Collections.Generic;
using Sirenix.Serialization;
using UnityEngine;

namespace Data
{
    [CreateAssetMenu(fileName = "TestModel", menuName = "Custom/Tests/TestModel", order = 0)]
    public class TestModel : Model<TestModel>
    {
        [OdinSerialize]
        public Dictionary<string, GameObject> Prefabs = new Dictionary<string, GameObject>();

        //public MyCustomDict<GameObject> tests = new MyCustomDict<GameObject>();
    }
}
