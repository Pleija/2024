using System.Collections.Generic;
using UnityEngine;

namespace Runner
{
    /// <summary>
    ///     This class allows us to create multiple instances of a prefabs and reuse them.
    ///     It allows us to avoid the cost of destroying and creating objects.
    /// </summary>
    public class Pooler
    {
        protected Stack<GameObject> m_FreeInstances = new Stack<GameObject>();
        protected GameObject m_Original;

        public Pooler(GameObject original, int initialSize)
        {
            m_Original = original;
            m_FreeInstances = new Stack<GameObject>(initialSize);

            for(var i = 0; i < initialSize; ++i) {
                var obj = Object.Instantiate(original);
                obj.SetActive(false);
                m_FreeInstances.Push(obj);
            }
        }

        public GameObject Get() => Get(Vector3.zero, Quaternion.identity);

        public GameObject Get(Vector3 pos, Quaternion quat)
        {
            var ret = m_FreeInstances.Count > 0 ? m_FreeInstances.Pop()
                : Object.Instantiate(m_Original);
            ret.SetActive(true);
            ret.transform.position = pos;
            ret.transform.rotation = quat;
            return ret;
        }

        public void Free(GameObject obj)
        {
            obj.transform.SetParent(null);
            obj.SetActive(false);
            m_FreeInstances.Push(obj);
        }
    }
}
