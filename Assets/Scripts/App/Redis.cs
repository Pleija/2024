
using Common;
using UnityEngine;

namespace App
{
    //[ExecuteAlways]
    public class Redis : Singleton<Redis>
    {
        public void Start()
        {
            RedisData.self.Test();
        }
    }
}
