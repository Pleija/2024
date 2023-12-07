using System.Collections;
using UnityEngine;

namespace Runner
{
    /// <summary>
    ///     This class allows us to start Coroutines from non-Monobehaviour scripts
    ///     Create a GameObject it will use to launch the coroutine on
    /// </summary>
    public class CoroutineHandler : MonoBehaviour
    {
        protected static CoroutineHandler m_Instance;

        public static CoroutineHandler instance {
            get {
                if (m_Instance != null) return m_Instance;
                var o = new GameObject("CoroutineHandler");
                DontDestroyOnLoad(o);
                m_Instance = o.AddComponent<CoroutineHandler>();
                return m_Instance;
            }
        }

        public void OnDisable()
        {
            if (m_Instance)
                Destroy(m_Instance.gameObject);
        }

        public static Coroutine StartStaticCoroutine(IEnumerator coroutine) => instance.StartCoroutine(coroutine);
    }
}
