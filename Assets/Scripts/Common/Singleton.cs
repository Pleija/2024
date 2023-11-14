using UnityEngine;

namespace Common
{
    public interface IAutoCreate { }
    public interface IDontDestroyOnLoad { }
    public class SingletonSample : Singleton<SingletonSample> { }

    public class Singleton<T> : Agent<T> where T : Singleton<T>
    {
        private static T m_Instance;
        public static bool HasInstance => m_Instance;

        public static T self {
            get {
                m_Instance ??= FindObjectOfType<T>(true);
                if(m_Instance) return m_Instance;
                if(!typeof(T).IsDefined(typeof(AutoCreateAttribute), true) &&
                   !typeof(IAutoCreate).IsAssignableFrom(typeof(T))) return m_Instance;
                var go = new GameObject(typeof(T).Name);
                m_Instance = go.AddComponent<T>();

                if((typeof(T).IsDefined(typeof(DontDestroyOnLoadAttribute), true) ||
                       typeof(IDontDestroyOnLoad).IsAssignableFrom(typeof(T))) &&
                   Application.isPlaying) {
                    if(go.transform.parent != null) go.transform.SetParent(null);
                    DontDestroyOnLoad(go);
                }
                return m_Instance;
            }
            set => m_Instance = value;
        }

        public override void OnEnable()
        {
            base.OnEnable();
            if(m_Instance == null) m_Instance = (T)this;

            if(GetType().IsDefined(typeof(DontDestroyOnLoadAttribute), true) ||
               typeof(IDontDestroyOnLoad).IsAssignableFrom(GetType())) {
                if(transform.parent != null) {
                    transform.SetParent(null);
                }
                DontDestroyOnLoad(gameObject);
            }
        }

        protected virtual void OnDestroy()
        {
            Dispose();
            if(m_Instance == this) m_Instance = null;
        }
    }
}
