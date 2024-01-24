#region
using System;
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Editor;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization.FullSerializer;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    ///----------------------------------------------------------------------------------------------
    internal class PrioritySelector_0 : BTComposite
    {
        [SerializeField]
        public List<BBParameter<float>> priorities = null;
    }

    ///----------------------------------------------------------------------------------------------
    [Category("Composites"),
     Description(
         "Used for Utility AI, the Priority Selector executes the child with the highest utility weight. If it fails, the Priority Selector will continue with the next highest utility weight child until one Succeeds, or until all Fail (similar to how a normal Selector does).\n\nEach child branch represents a desire, where each desire has one or more consideration which are all averaged.\nConsiderations are a pair of input value and curve, which together produce the consideration utility weight.\n\nIf Dynamic option is enabled, will continously evaluate utility weights and execute the child with the highest one regardless of what status the children return."),
     Icon("Priority"), Color("b3ff7f"), fsMigrateVersions(typeof(PrioritySelector_0))]
    public class PrioritySelector : BTComposite, IMigratable<PrioritySelector_0>
    {
        private int current;

        [AutoSortWithChildrenConnections]
        public List<Desire> desires;

        ///----------------------------------------------------------------------------------------------
        [Tooltip(
            "If enabled, will continously evaluate utility weights and execute the child with the highest one accordingly. In this mode child return status does not matter.")]
        public bool dynamic;

        private Connection[] orderedConnections;

        ///----------------------------------------------------------------------------------------------
        void IMigratable<PrioritySelector_0>.Migrate(PrioritySelector_0 model)
        {
            desires = new List<Desire>();

            foreach (var priority in model.priorities) {
                var desire = new Desire();
                desires.Add(desire);
                var consideration = desire.AddConsideration(graphBlackboard);
                consideration.input = priority;
            }
        }

        public override void OnChildConnected(int index)
        {
            if (desires == null) desires = new List<Desire>();
            if (desires.Count < outConnections.Count) desires.Insert(index, new Desire());
        }

        public override void OnChildDisconnected(int index)
        {
            desires.RemoveAt(index);
        }

        protected override Status OnExecute(Component agent, IBlackboard blackboard)
        {
            if (dynamic) {
                var highestPriority = float.NegativeInfinity;
                var best = 0;

                for (var i = 0; i < outConnections.Count; i++) {
                    var priority = desires[i].GetCompoundUtility();

                    if (priority > highestPriority) {
                        highestPriority = priority;
                        best = i;
                    }
                }

                if (best != current) {
                    outConnections[current].Reset();
                    current = best;
                }
                return outConnections[current].Execute(agent, blackboard);
            }
            ///----------------------------------------------------------------------------------------------
            if (status == Status.Resting)
                orderedConnections = outConnections
                        .OrderBy(c => desires[outConnections.IndexOf(c)].GetCompoundUtility())
                        .ToArray();

            for (var i = orderedConnections.Length; i-- > 0;) {
                status = orderedConnections[i].Execute(agent, blackboard);
                if (status == Status.Success) return Status.Success;

                if (status == Status.Running) {
                    current = i;
                    return Status.Running;
                }
            }
            return Status.Failure;
        }

        protected override void OnReset()
        {
            current = 0;
        }

        ///----------------------------------------------------------------------------------------------
        [Serializable]
        public class Desire
        {
            [fsIgnoreInBuild]
            public string name;

            [fsIgnoreInBuild]
            public bool foldout;

            public List<Consideration> considerations = new List<Consideration>();

            public Consideration AddConsideration(IBlackboard bb)
            {
                var result = new Consideration(bb);
                considerations.Add(result);
                return result;
            }

            public void RemoveConsideration(Consideration consideration)
            {
                considerations.Remove(consideration);
            }

            public float GetCompoundUtility()
            {
                float total = 0;
                for (var i = 0; i < considerations.Count; i++) total += considerations[i].utility;
                return total / considerations.Count;
            }
        }

        [Serializable]
        public class Consideration
        {
            public BBParameter<float> input;
            public BBParameter<AnimationCurve> function;

            public Consideration(IBlackboard blackboard)
            {
                input = new BBParameter<float> { value = 1f, bb = blackboard };
                function = new BBParameter<AnimationCurve> { bb = blackboard };
            }

            public float utility => function.value != null ? function.value.Evaluate(input.value)
                    : input.value;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR

        //..
        public override string GetConnectionInfo(int i)
        {
            var desire = desires[i];
            var desireName = string.IsNullOrEmpty(desire.name) ? "DESIRE " + i : desire.name;
            var result = desireName.ToUpper() + "\n";
            for (var j = 0; j < desire.considerations.Count; j++)
                result += desire.considerations[j].input
                        + " ("
                        + desire.considerations[j].utility.ToString("0.00")
                        + ")"
                        + "\n";
            return result += string.Format("<b>Avg.</b> ({0})",
                desire.GetCompoundUtility().ToString("0.00"));
        }

        //..
        public override void OnConnectionInspectorGUI(int i)
        {
            var desire = desires[i];
            var optionsB = new EditorUtils.ReorderableListOptions();
            optionsB.allowAdd = false;
            optionsB.allowRemove = true;
            EditorUtils.ReorderableList(desire.considerations, optionsB, (j, pickedB) => {
                var consideration = desire.considerations[j];
                GUILayout.BeginVertical("box");
                consideration.input =
                        (BBParameter<float>)BBParameterEditor.ParameterField("Input",
                            consideration.input, true);
                consideration.function =
                        (BBParameter<AnimationCurve>)BBParameterEditor.ParameterField("Curve",
                            consideration.function);
                GUILayout.EndVertical();
            });
            if (GUILayout.Button("Add Consideration")) desire.AddConsideration(graphBlackboard);
            EditorUtils.Separator();
        }

        protected override void OnNodeGUI()
        {
            if (dynamic) GUILayout.Label("<b>DYNAMIC</b>");
        }

        //..
        protected override void OnNodeInspectorGUI()
        {
            if (outConnections.Count == 0) {
                GUILayout.Label("Make some connections first");
                return;
            }
            dynamic = EditorGUILayout.Toggle(new GUIContent("Dynamic",
                    "If enabled, will continously evaluate utility weights and execute the child with the highest one accordingly. In this mode child return status does not matter."),
                dynamic);
            EditorUtils.Separator();
            EditorUtils.CoolLabel("Desires");
            var optionsA = new EditorUtils.ReorderableListOptions();
            optionsA.allowAdd = false;
            optionsA.allowRemove = false;
            EditorUtils.ReorderableList(desires, optionsA, (i, pickedA) => {
                var desire = desires[i];
                var desireName = string.IsNullOrEmpty(desire.name) ? "DESIRE " + i
                        : desire.name;
                desire.foldout = EditorGUILayout.Foldout(
                    desire.foldout, new GUIContent(desireName));

                if (desire.foldout) {
                    desire.name = EditorGUILayout.TextField("   Friendly Name", desire.name);
                    OnConnectionInspectorGUI(i);
                }
            });
        }
#endif
    }
}
