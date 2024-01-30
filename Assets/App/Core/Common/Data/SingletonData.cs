using Sirenix.OdinInspector;
using UnityEngine;
using Object = UnityEngine.Object;

namespace Data
{
    [CreateAssetMenu(fileName = "Storage", menuName = "Custom/Storage")]
    public class SingletonData : SerializedScriptableObject { }

    public class SingletonData<T> : SingletonData, ISetInstance where T : SingletonData<T>
    {
        protected static T m_Instance;
        protected static bool m_Cached;

        public static T instance {
            get => m_Instance != null ? m_Instance : m_Instance = Core.FindOrCreatePreloadAsset<T>();
            set => m_Instance = value;
        }

        public static T LoadInstance(T value = null) {
            if (value != null) return m_Instance = value;

            if (m_Instance == null && !m_Cached) {
                m_Cached = true;
                return m_Instance = Core.LoadAsset<T>();
            }

            return m_Instance;
        }

//        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
//        static void ClearInstance()
//        {
//            m_Cached = false;
//            m_Instance = null;
//        }

        protected virtual void OnEnable() {
            m_Instance = (T) this;
        }

        protected virtual void OnDestroy() {
            if (m_Instance == this) m_Instance = null;
        }

        public void SetInstance(Object target) {
            if (target is T obj) m_Instance = obj;
        }
    }
}
