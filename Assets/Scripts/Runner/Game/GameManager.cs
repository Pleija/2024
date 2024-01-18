﻿using System;
using System.Collections.Generic;
using System.Linq;
using App;
using Runner.Consumable;
using Sirenix.Utilities;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Events;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runner.Game
{
#if UNITY_ANALYTICS
    using UnityEngine.Analytics;
#endif

    /// <summary>
    ///     The Game manager is a state machine, that will switch between state according to current
    ///     gamestate.
    /// </summary>
    public class GameManager : Singleton<GameManager>
    {
        public static GameManager instance => s_Instance;
        public static GameManager s_Instance;
        public GameObject[] Prefabs;
        public List<AState> states = new List<AState>();
        public GameObject LoadingCharPos;

        public AState topState {
            get {
                if (m_StateStack.Count == 0) return null;
                return m_StateStack[m_StateStack.Count - 1];
            }
        }

        public ConsumableDatabase m_ConsumableDatabase;
        public List<AState> m_StateStack = new List<AState>();
        public Dictionary<string, AState> m_StateDict = new Dictionary<string, AState>();
        public UnityEvent OnEnableEvent;
        public UnityEvent OnStartEvent;

        public override void OnEnable()
        {
            base.OnEnable();
            s_Instance = this;
            OnEnableEvent.Invoke();

            // if (Debug.isDebugBuild) {
            //     var handle = Addressables.CheckForCatalogUpdates(false);
            //     await handle.Task;
            //
            //     if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Any()) {
            //         Debug.Log("Catalog updating");
            //         await Addressables.UpdateCatalogs(handle.Result).Task;
            //         await Addressables.DownloadDependenciesAsync("Main").Task;
            //         await JsMain.self.Reload(true);
            //         Addressables.LoadSceneAsync("Main");
            //     }
            //     Addressables.Release(handle);
            // }
        }

        private void Start()
        {
            OnStartEvent.Invoke();
        }

        public void DoStart()
        {
            PlayerData.Create();
            m_ConsumableDatabase.Load();
            states ??= new List<AState>();
            Prefabs.ForEach(prefab => {
                prefab.SetActive(false);
                var go = Instantiate(prefab, transform);
                go.name = prefab.name;
                states.Add(go.GetComponent<AState>());
                prefab.SetActive(true);
            });

            // We build a dictionnary from state for easy switching using their name.
            m_StateDict.Clear();
            if (states.Count == 0)
                return;

            for (var i = 0; i < states.Count; ++i) {
                states[i].manager = this;
                m_StateDict.Add(states[i].GetName(), states[i]);
                states[i].gameObject.SetActive(i == 0);
            }
            m_StateStack.Clear();
            PushState(states[0].GetName());
        }

        public void Update()
        {
            if (m_StateStack.Count > 0) m_StateStack[m_StateStack.Count - 1].Tick();
        }

        public void OnApplicationQuit()
        {
#if UNITY_ANALYTICS
            // We are exiting during game, so this make this invalid, send an event to log it
            // NOTE : this is only called on standalone build, as on mobile this function isn't called
            var inGameExit = m_StateStack[m_StateStack.Count - 1].GetType() == typeof(GameState);
            Analytics.CustomEvent("user_end_session",
                new Dictionary<string, object> {
                    { "force_exit", inGameExit }, { "timer", Time.realtimeSinceStartup },
                });
#endif
        }

        // State management
        public void SwitchState(string newState)
        {
            var state = FindState(newState);

            if (state == null) {
                Debug.LogError("Can't find the state named " + newState);
                return;
            }
            m_StateStack[m_StateStack.Count - 1].DoExit(t => t.Exit(state));
            state.DoEnter(t => t.Enter(m_StateStack[m_StateStack.Count - 1]));
            m_StateStack.RemoveAt(m_StateStack.Count - 1);
            m_StateStack.Add(state);
        }

        public AState FindState(string stateName)
        {
            AState state;
            if (!m_StateDict.TryGetValue(stateName, out state)) return null;
            return state;
        }

        public void PopState()
        {
            if (m_StateStack.Count < 2) {
                Debug.LogError("Can't pop states, only one in stack.");
                return;
            }
            m_StateStack[m_StateStack.Count - 1].DoExit(t => t.Exit(m_StateStack[m_StateStack.Count - 2]));
            m_StateStack[m_StateStack.Count - 2].DoEnter(t => t.Enter(m_StateStack[m_StateStack.Count - 2]));
            m_StateStack.RemoveAt(m_StateStack.Count - 1);
        }

        public void PushState(string name)
        {
            AState state;

            if (!m_StateDict.TryGetValue(name, out state)) {
                Debug.LogError("Can't find the state named " + name);
                return;
            }

            if (m_StateStack.Count > 0) {
                m_StateStack[m_StateStack.Count - 1].DoExit(t => t.Exit(state));
                //state.OnEnter?.Invoke();
                state.DoEnter(t => t.Enter(m_StateStack[m_StateStack.Count - 1]));
            }
            else {
                state.DoEnter(t => t.Enter(null));
            }
            m_StateStack.Add(state);
        }
    }

    public abstract class AState : MonoBehaviour
    {
        [HideInInspector]
        public GameManager manager;

        public UnityEvent<AState> OnEnter;
        public UnityEvent<AState> OnExit;
        public UnityEvent<AState> AfterEnter;
        public UnityEvent<AState> AfterExit;
        public virtual void OnEnable() { }

        public AState DoEnter(Action<AState> fn)
        {
            Debug.Log($"{GetType().Name} => Enter");
            OnEnter?.Invoke(this);
            fn.Invoke(this);
            AfterEnter?.Invoke(this);
            return this;
        }

        public AState DoExit(Action<AState> fn)
        {
            Debug.Log($"{GetType().Name} => Exit");
            OnExit?.Invoke(this);
            fn.Invoke(this);
            AfterExit?.Invoke(this);
            return this;
        }

        public abstract void Enter(AState from);
        public abstract void Exit(AState to);
        public abstract void Tick();
        public abstract string GetName();
    }
}
