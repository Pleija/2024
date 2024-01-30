using Runtime.Attributes;
using Runtime.Contracts;
using Runtime.Models;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using UnityEngine;

namespace Runtime
{
    [CreateAssetMenu(fileName = nameof(DBManager), menuName = "Custom/Common/" + nameof(DBManager))]
    [PreloadSetting]
    public class DBManager : SerializedScriptableObject, ISingleScriptable /*, IObjectInitializationDataProvider*/
    {
        //
        public TextAsset file;
        public TextAsset devFile;
        public bool useDevFile;
        static DBManager _instance;

        public static DBManager instance {
            get => _instance.AsNull() ?? (_instance = Core.FindOrCreatePreloadAsset<DBManager>());
            set => _instance = value;
        }

        void OnEnable() {
            Debug.Log(GetType().GetNiceFullName() + " loaded".ToYellow());
            _instance = _instance.AsNull() ?? this;
        }

        /*public ObjectInitializationData CreateObjectInitializationData()
        {
            _instance = _instance ??= Core.FindOrCreatePreloadAsset<DBManager>();
        #if UNITY_EDITOR
            if (Application.isEditor) {
                return ObjectInitializationData.CreateSerializedInitializationData<DBManager>(Name, _instance);
            }
        #endif
            return default;
        }

        public string Name => nameof(DBManager);*/
        public void SetInstance(ScriptableObject target) {
            _instance = target as DBManager;
        }
    }
}
