using System.Linq;
using System.Reflection;
using UnityEditor;
using UnityEngine;

public interface IAutoCreate { }
public interface IDontDestroyOnLoad { }
public interface IEditorUpdate { }
public class SingletonSample : Singleton<SingletonSample> { }

public class Singleton<T> : View<T> where T : Singleton<T>
{
    private static T m_Instance;
    public static bool HasInstance => m_Instance;

    public static T self {
        get {
            m_Instance ??= FindObjectOfType<T>(true);
            if (m_Instance) return m_Instance;
            if (!typeof(T).IsDefined(typeof(AutoCreateAttribute), true) &&
                !typeof(IAutoCreate).IsAssignableFrom(typeof(T)))
                return m_Instance;
            var go = new GameObject(typeof(T).Name);
            m_Instance = go.AddComponent<T>();

            if (Application.isPlaying) {
                m_Instance.CheckDontUnload();
            }
            else {
                go.hideFlags = HideFlags.HideAndDontSave;
#if UNITY_EDITOR
                if (typeof(IEditorUpdate).IsAssignableFrom(typeof(T))) {
                    EditorApplication.update -= EditorUpdate;
                    EditorApplication.update += EditorUpdate;
                }
#endif
            }
            return m_Instance;
        }
        set => m_Instance = value;
    }

    public static void EditorUpdate()
    {
        if (m_Instance) {
            UpdateMethodInfo ??= m_Instance.GetType().GetMethod("Update"
                , BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);

            if (UpdateMethodInfo != null) {
                UpdateMethodInfo.Invoke(m_Instance, null);
                return;
            }
        }
#if UNITY_EDITOR
        EditorApplication.update -= EditorUpdate;
#endif
    }

    public static MethodInfo UpdateMethodInfo { get; set; }

    // public virtual void Update() { }

    public override void OnEnable()
    {
        base.OnEnable();

        if (m_Instance == null) {
            m_Instance = (T)this;
            CheckDontUnload();
        }
    }

    public void CheckDontUnload()
    {
        if (!Application.isPlaying) return;

        if (GetType().IsDefined(typeof(DontDestroyOnLoadAttribute), true) ||
            typeof(IDontDestroyOnLoad).IsAssignableFrom(GetType())) {
            if (transform.parent != null) transform.SetParent(null);
            DontDestroyOnLoad(gameObject);
        }
    }
}
