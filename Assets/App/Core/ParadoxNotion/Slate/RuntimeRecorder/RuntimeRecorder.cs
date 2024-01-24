#region
using System;
using System.Linq;
using UnityEngine;
#endregion

namespace Slate
{
    ///Records properties in runtime which can be applied to an AnimationClip
    public class RuntimeRecorder
    {
        private TransformRecorder[] recorders;

        ///----------------------------------------------------------------------------------------------
        private Transform[] targetObjects;

        //Create a new Recorder for target root gameobject with specified options
        public RuntimeRecorder(GameObject root, Options options)
        {
            Initialize(root, options);
        }

        //Init the Recorder for target root gameobject with specified options
        public void Initialize(GameObject root, Options options)
        {
            targetObjects = options.includeRootGameObject
                    ? root.GetComponentsInChildren<Transform>() : root
                            .GetComponentsInChildren<Transform>()
                            .Where(t => t != root.transform)
                            .ToArray();
            recorders = new TransformRecorder[targetObjects.Length];

            for (var i = 0; i < targetObjects.Length; i++) {
                var path = root.transform.CalculateTransformPath(targetObjects[i]);
                recorders[i] = new TransformRecorder(path, targetObjects[i]);
            }
        }

        ///Record a frame
        public void RecordFrame(float time)
        {
            for (var i = 0; i < recorders.Length; i++) recorders[i].RecordFrame(time);
        }

        ///Apply the recorded animation to a clip
        public void ApplyToClip(AnimationClip clip)
        {
            clip.ClearCurves();

            for (var i = 0; i < recorders.Length; i++) {
                var recorder = recorders[i];
                var properties = recorders[i].recordedProperties;

                for (var j = 0; j < properties.Length; j++) {
                    var property = properties[j];
                    var path = recorder.hierarchyPath;
                    var type = recorder.type;
                    var name = property.name;
                    var curve = property.curve;
                    clip.SetCurve(path, type, name, curve);
                }
            }
            clip.EnsureQuaternionContinuity();
        }

        [Serializable]
        public struct Options
        {
            public bool includeRootGameObject;
            public static Options Default() => new Options { includeRootGameObject = true };
        }

        ///----------------------------------------------------------------------------------------------
        ///A Recorded Animation Property for Runtime Recorder
        public struct RecorderProperty
        {
            public string name;
            public AnimationCurve curve;

            public RecorderProperty(string name)
            {
                this.name = name;
                curve = new AnimationCurve();
            }

            public void Record(float time, float value)
            {
                var key = new Keyframe(time, value, 0.0f, 0.0f);
                curve.AddKey(key);
            }
        }
    }
}
