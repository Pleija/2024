using UnityEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Slate
{
    [Attachable(typeof(ActionTrack))]
    ///<summary>Clips are added in CutsceneTracks to make stuff happen</summary>
    public abstract class ActionClip : MonoBehaviour, IDirectable, IKeyable
    {
        [SerializeField, HideInInspector]
        private float _startTime;

        [SerializeField, HideInInspector]
        private AnimationDataCollection _animationData;

        public IDirector root => parent != null ? parent.root : null;
        public IDirectable parent { get; private set; }
        public GameObject actor => parent != null ? parent.actor : null;
        IEnumerable<IDirectable> IDirectable.children => null;

        ///<summary>All animated parameters are stored within this collection object</summary>
        public AnimationDataCollection animationData {
            get => _animationData;
            private set => _animationData = value;
        }

        //...
        public float startTime {
            get => _startTime;
            set {
                if (_startTime != value) {
                    _startTime = Mathf.Max(value, 0);
                    blendIn = Mathf.Clamp(blendIn, 0, length - blendOut);
                    blendOut = Mathf.Clamp(blendOut, 0, length - blendIn);
                }
            }
        }

        //...
        public float endTime {
            get => startTime + length;
            set {
                if (startTime + length != value) {
                    length = Mathf.Max(value - startTime, 0);
                    blendOut = Mathf.Clamp(blendOut, 0, length - blendIn);
                    blendIn = Mathf.Clamp(blendIn, 0, length - blendOut);
                }
            }
        }

        //...
        public bool isActive => parent != null ? parent.isActive && isValid : false;

        //...
        public bool isCollapsed => parent != null ? parent.isCollapsed : false;

        //...
        public bool isLocked => parent != null ? parent.isLocked : false;

        ///<summary>The length of the clip. Override for scalable clips.</summary>
        public virtual float length {
            get => 0;
            set { }
        }

        /// <summary>
        ///     The blend in value of the clip. A value of zero means instant. Override for blendable in
        ///     clips.
        /// </summary>
        public virtual float blendIn {
            get => 0;
            set { }
        }

        /// <summary>
        ///     The blend out value of the clip. A value of zero means instant. Override for blendable out
        ///     clips.
        /// </summary>
        public virtual float blendOut {
            get => 0;
            set { }
        }

        ///<summary>Should the clip be able to cross-blend between other clips of the same type?</summary>
        public virtual bool canCrossBlend => false;

        ///<summary>A short summary. Overide this to show something specific in the action clip in the editor.</summary>
        public virtual string info {
            get {
                var nameAtt = GetType().RTGetAttribute<NameAttribute>(true);
                if (nameAtt != null) return nameAtt.name;
                return GetType().Name.SplitCamelCase();
            }
        }

        ///<summary>Is everything ok for the clip to work?</summary>
        public virtual bool isValid => actor != null;

        public virtual TransformSpace defaultTransformSpace => TransformSpace.CutsceneSpace;

        //An array of property/field paths that will be possible to animate.
        //By default all properties/fields in the actionclip class with an [AnimatableParameter] attribute will be used.
        [NonSerialized]
        private string[] _cachedAnimParamPaths;

        private string[] animatedParameterPaths => _cachedAnimParamPaths != null
            ? _cachedAnimParamPaths : _cachedAnimParamPaths =
                AnimationDataUtility.GetAnimatableMemberPaths(this);

        //If the params target is not this, registration of parameters should be handled manually
        protected virtual bool handleParametersRegistrationManually =>
            !ReferenceEquals(animatedParametersTarget, this);

        /// <summary>
        ///     The target instance of the animated properties/fields. By default the instance of THIS action
        ///     clip is used. Do
        ///     NOT override if you don't know why! :)
        /// </summary>
        public virtual object animatedParametersTarget => this;

        /// <summary>
        ///     The interpolation to use when blending parameters. Only relevant when
        ///     useWeightInParameters is true.
        /// </summary>
        public virtual EaseType animatedParametersInterpolation => EaseType.Linear;

        ///<summary>Whether or not clip weight will be used in parameters automatically.</summary>
        public virtual bool useWeightInParameters => false;

        ///<summary>Does the clip has any parameters?</summary>
        public bool hasParameters => animationData != null && animationData.isValid;

        ///<summary>Does the clip has any active parameters?</summary>
        public bool hasActiveParameters {
            get {
                if (!hasParameters || !isValid) return false;
                for (var i = 0; i < animationData.animatedParameters.Count; i++)
                    if (animationData.animatedParameters[i].enabled)
                        return true;
                return false;
            }
        }

        bool IDirectable.Initialize() => OnInitialize();

        void IDirectable.Enter()
        {
            SetAnimParamsSnapshot();
            OnEnter();
        }

        void IDirectable.Update(float time, float previousTime)
        {
            UpdateAnimParams(time, previousTime);
            OnUpdate(time, previousTime);
        }

        void IDirectable.Exit()
        {
            OnExit();
        }

        void IDirectable.ReverseEnter()
        {
            OnReverseEnter();
        }

        void IDirectable.Reverse()
        {
            RestoreAnimParamsSnapshot();
            OnReverse();
        }

        void IDirectable.RootEnabled()
        {
            OnRootEnabled();
        }

        void IDirectable.RootDisabled()
        {
            OnRootDisabled();
        }

        void IDirectable.RootUpdated(float time, float previousTime)
        {
            OnRootUpdated(time, previousTime);
        }

        void IDirectable.RootDestroyed()
        {
            OnRootDestroyed();
        }

#if UNITY_EDITOR
        void IDirectable.DrawGizmos(bool selected)
        {
            if (selected && actor != null && isValid) OnDrawGizmosSelected();
        }

        private Dictionary<MemberInfo, Attribute[]> paramsAttributes =
            new Dictionary<MemberInfo, Attribute[]>();

        void IDirectable.SceneGUI(bool selected)
        {
            if (!selected || actor == null || !isValid) return;

            if (hasParameters)
                for (var i = 0; i < animationData.animatedParameters.Count; i++) {
                    var animParam = animationData.animatedParameters[i];
                    if (!animParam.isValid || animParam.animatedType != typeof(Vector3)) continue;
                    var m = animParam.GetMemberInfo();
                    Attribute[] attributes = null;

                    if (!paramsAttributes.TryGetValue(m, out attributes)) {
                        attributes = (Attribute[])m.GetCustomAttributes(false);
                        paramsAttributes[m] = attributes;
                    }
                    ITransformRefParameter link = null;
                    var animAtt =
                        attributes.FirstOrDefault(a => a is AnimatableParameterAttribute) as
                            AnimatableParameterAttribute;

                    if (animAtt !=
                        null) //only in case parameter has been added manualy. Probably never.
                        if (!string.IsNullOrEmpty(animAtt.link))
                            try {
                                link =
                                    GetType().GetField(animAtt.link).GetValue(this) as
                                        ITransformRefParameter;
                            }
                            catch (Exception exc) {
                                Debug.LogException(exc);
                            }

                    if (link == null || link.useAnimation) {
                        var space = link != null ? link.space : defaultTransformSpace;
                        var posHandleAtt =
                            attributes.FirstOrDefault(a => a is PositionHandleAttribute) as
                                PositionHandleAttribute;

                        if (posHandleAtt != null) {
                            Vector3? rotVal = null;

                            if (!string.IsNullOrEmpty(posHandleAtt.rotationPropertyName)) {
                                var rotProp = GetType()
                                    .RTGetFieldOrProp(posHandleAtt.rotationPropertyName);
                                rotVal = rotProp != null
                                    ? (Vector3)rotProp.RTGetFieldOrPropValue(this) : default;
                            }
                            DoParameterPositionHandle(animParam, space, rotVal);
                        }
                        var rotHandleAtt =
                            attributes.FirstOrDefault(a => a is RotationHandleAttribute) as
                                RotationHandleAttribute;

                        if (rotHandleAtt != null) {
                            var posProp = GetType()
                                .RTGetFieldOrProp(rotHandleAtt.positionPropertyName);
                            var posVal = posProp != null
                                ? (Vector3)posProp.RTGetFieldOrPropValue(this) : default;
                            DoParameterRotationHandle(animParam, space, posVal);
                        }
                        var trajAtt =
                            attributes.FirstOrDefault(a => a is ShowTrajectoryAttribute) as
                                ShowTrajectoryAttribute;
                        if (trajAtt != null && animParam.enabled)
                            CurveEditor3D.Draw3DCurve(animParam, this, GetSpaceTransform(space),
                                length / 2, length);
                    }
                }
            OnSceneGUI();
        }

        protected bool
            DoParameterPositionHandle(AnimatedParameter animParam, TransformSpace space) =>
            SceneGUIUtility.DoParameterPositionHandle(this, animParam, space, null);

        protected bool DoParameterPositionHandle(AnimatedParameter animParam, TransformSpace space,
            Vector3? euler) =>
            SceneGUIUtility.DoParameterPositionHandle(this, animParam, space, euler);

        protected bool DoParameterRotationHandle(AnimatedParameter animParam, TransformSpace space,
            Vector3 position) =>
            SceneGUIUtility.DoParameterRotationHandle(this, animParam, space, position);

        protected bool DoVectorPositionHandle(TransformSpace space, ref Vector3 position) =>
            SceneGUIUtility.DoVectorPositionHandle(this, space, ref position);

        protected bool DoVectorPositionHandle(TransformSpace space, Vector3 euler,
            ref Vector3 position) =>
            SceneGUIUtility.DoVectorPositionHandle(this, space, euler, ref position);

        protected bool DoVectorRotationHandle(TransformSpace space, Vector3 position,
            ref Vector3 euler) =>
            SceneGUIUtility.DoVectorRotationHandle(this, space, position, ref euler);
#endif

        ///<summary>After creation</summary>
        public void PostCreate(IDirectable parent)
        {
            this.parent = parent;
            CreateAnimationDataCollection();
            OnCreate();
        }

        //Validate the clip
        public void Validate()
        {
            OnAfterValidate();
        }

        public void Validate(IDirector root, IDirectable parent)
        {
            this.parent = parent;
            hideFlags = HideFlags.HideInHierarchy;
            ValidateAnimParams();
            OnAfterValidate();
        }

        //HOOKS
        ///----------------------------------------------------------------------------------------------
        protected virtual bool OnInitialize() => true;

        protected virtual void OnEnter() { }

        protected virtual void OnUpdate(float time, float previousTime)
        {
            OnUpdate(time);
        }

        protected virtual void OnUpdate(float time) { }
        protected virtual void OnExit() { }
        protected virtual void OnReverse() { }
        protected virtual void OnReverseEnter() { }
        protected virtual void OnDrawGizmosSelected() { }
        protected virtual void OnSceneGUI() { }
        protected virtual void OnCreate() { }
        protected virtual void OnAfterValidate() { }
        protected virtual void OnRootEnabled() { }
        protected virtual void OnRootDisabled() { }
        protected virtual void OnRootUpdated(float time, float previousTime) { }
        protected virtual void OnRootDestroyed() { }
        ///----------------------------------------------------------------------------------------------

        //SHORTCUTS
        ///----------------------------------------------------------------------------------------------
        ///<summary>Is the root time within clip time range? A helper method.</summary>
        public bool RootTimeWithinRange() => IDirectableExtensions.IsRootTimeWithinClip(this);

        ///<summary>Transforms a point in specified space</summary>
        public Vector3 TransformPosition(Vector3 point, TransformSpace space) =>
            IDirectableExtensions.TransformPosition(this, point, space);

        ///<summary>Inverse Transforms a point in specified space</summary>
        public Vector3 InverseTransformPosition(Vector3 point, TransformSpace space) =>
            IDirectableExtensions.InverseTransformPosition(this, point, space);

        ///<summary>Transform an euler rotation in specified space and into a quaternion</summary>
        public Quaternion TransformRotation(Vector3 euler, TransformSpace space) =>
            IDirectableExtensions.TransformRotation(this, euler, space);

        ///<summary>Trasnform a quaternion rotation in specified space and into an euler rotation</summary>
        public Vector3 InverseTransformRotation(Quaternion rot, TransformSpace space) =>
            IDirectableExtensions.InverseTransformRotation(this, rot, space);

        ///<summary>Returns the final actor position in specified Space (InverseTransform Space)</summary>
        public Vector3 ActorPositionInSpace(TransformSpace space) =>
            IDirectableExtensions.ActorPositionInSpace(this, space);

        /// <summary>
        ///     Returns the transform object used for specified Space transformations. Null if World
        ///     Space.
        /// </summary>
        public Transform GetSpaceTransform(TransformSpace space, GameObject actorOverride = null) =>
            IDirectableExtensions.GetSpaceTransform(this, space, actorOverride);

        ///<summary>Returns the previous clip in parent track</summary>
        public ActionClip GetPreviousClip() => this.GetPreviousSibling<ActionClip>();

        ///<summary>Returns the next clip in parent track</summary>
        public ActionClip GetNextClip() => this.GetNextSibling<ActionClip>();

        ///<summary>The current clip weight based on blend properties and based on root current time.</summary>
        public float GetClipWeight() => GetClipWeight(root.currentTime - startTime);

        ///<summary>The weight of the clip at specified local time based on its blend properties.</summary>
        public float GetClipWeight(float time) => GetClipWeight(time, blendIn, blendOut);

        /// <summary>
        ///     The weight of the clip at specified local time based on provided override blend in/out
        ///     properties
        /// </summary>
        public float GetClipWeight(float time, float blendInOut) =>
            GetClipWeight(time, blendInOut, blendInOut);

        public float GetClipWeight(float time, float blendIn, float blendOut) =>
            this.GetWeight(time, blendIn, blendOut);

        ///----------------------------------------------------------------------------------------------
        public void TryMatchSubClipLength()
        {
            if (this is ISubClipContainable)
                length = (this as ISubClipContainable).subClipLength /
                    (this as ISubClipContainable).subClipSpeed;
        }

        ///<summary>Try set the clip length to match previous subclip loop if this contains a subclip at all.</summary>
        public void TryMatchPreviousSubClipLoop()
        {
            if (this is ISubClipContainable)
                length = (this as ISubClipContainable).GetPreviousLoopLocalTime();
        }

        ///<summary>Try set the clip length to match next subclip loop if this contains a subclip at all.</summary>
        public void TryMatchNexSubClipLoop()
        {
            if (this is ISubClipContainable) {
                var targetLength = (this as ISubClipContainable).GetNextLoopLocalTime();
                var nextClip = GetNextClip();
                if (nextClip == null || startTime + targetLength <= nextClip.startTime)
                    length = targetLength;
            }
        }

        //...
        private string GetParameterName<T, TResult>(
            System.Linq.Expressions.Expression<Func<T, TResult>> func) =>
            ReflectionTools.GetMemberPath(func);

        /// <summary>
        ///     Get the AnimatedParameter of name. The name is usually the same as the field/property name that
        ///     [AnimatableParameter] is used on.
        /// </summary>
        public AnimatedParameter GetParameter<T, TResult>(
            System.Linq.Expressions.Expression<Func<T, TResult>> func) =>
            GetParameter(GetParameterName(func));

        /// <summary>
        ///     Get the AnimatedParameter of name. The name is usually the same as the field/property name that
        ///     [AnimatableParameter] is used on.
        /// </summary>
        public AnimatedParameter GetParameter(string paramName) => animationData != null
            ? animationData.GetParameterOfName(paramName) : null;

        ///<summary>Enable/Disable an AnimatedParameter of name</summary>
        public void SetParameterEnabled<T, TResult>(
            System.Linq.Expressions.Expression<Func<T, TResult>> func, bool enabled)
        {
            SetParameterEnabled(GetParameterName(func), enabled);
        }

        ///<summary>Enable/Disable an AnimatedParameter of name</summary>
        public void SetParameterEnabled(string paramName, bool enabled)
        {
            var animParam = GetParameter(paramName);
            if (animParam != null) animParam.SetEnabled(enabled, root.currentTime - startTime);
        }

        ///<summary>Re-Init/Reset all existing animated parameters</summary>
        public void ResetAnimatedParameters()
        {
            if (animationData != null) animationData.Reset();
        }

        //Creates the animation data collection out of the fields/properties marked with [AnimatableParameter] attribute
        private void CreateAnimationDataCollection()
        {
            if (handleParametersRegistrationManually) return;
            if (animatedParameterPaths != null && animatedParameterPaths.Length != 0)
                animationData =
                    new AnimationDataCollection(this, GetType(), animatedParameterPaths, null);
        }

        //Validate the animation parameters vs the animation data collection to be synced, adding or removing as required.
        private void ValidateAnimParams()
        {
            if (animationData != null) animationData.Validate(this);

            //we don't need validation in runtime
            if (Application.isPlaying) return;
            if (handleParametersRegistrationManually) return;

            if (animatedParameterPaths == null || animatedParameterPaths.Length == 0) {
                animationData = null;
                return;
            }

            //try append new
            for (var i = 0; i < animatedParameterPaths.Length; i++) {
                var memberPath = animatedParameterPaths[i];
                if (!string.IsNullOrEmpty(memberPath))
                    animationData.TryAddParameter(this, GetType(), memberPath, null);
            }

            //cleanup
            foreach (var animParam in animationData.animatedParameters.ToArray()) {
                if (!animParam.isValid) {
                    animationData.RemoveParameter(animParam);
                    continue;
                }

                if (!animatedParameterPaths.Contains(animParam.parameterName)) {
                    animationData.RemoveParameter(animParam);
                    continue;
                }
            }
        }

        //Set an animation snapshot for all parameters
        private void SetAnimParamsSnapshot()
        {
            if (hasParameters) {
                animationData.SetVirtualTransformParent(GetSpaceTransform(defaultTransformSpace));
                animationData.SetSnapshot();
            }
        }

        //Update the animation parameters, setting their evaluated values
        private void UpdateAnimParams(float time, float previousTime)
        {
            if (hasParameters) {
                var ease = 1f;

                if (useWeightInParameters) {
                    var clipWeight = GetClipWeight(time);
                    ease = animatedParametersInterpolation == EaseType.Linear ? clipWeight
                        : Easing.Ease(animatedParametersInterpolation, 0, 1, clipWeight);
                }
                animationData.Evaluate(time, previousTime, ease);
            }
        }

        //Restore the animation snapshot on all parameters
        private void RestoreAnimParamsSnapshot()
        {
            if (hasParameters) animationData.RestoreSnapshot();
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR

        ///<summary>Unity callback.</summary>
        protected void OnValidate()
        {
            OnEditorValidate();
        }

        ///<summary>Show clip GUI contents</summary>
        public void ShowClipGUI(Rect rect)
        {
            OnClipGUI(rect);
        }

        ///<summary>This is called outside of the clip for UI on the the left/right sides of the clip.</summary>
        public void ShowClipGUIExternal(Rect left, Rect right)
        {
            OnClipGUIExternal(left, right);
        }

        ///<summary>Override for extra clip GUI contents.</summary>
        protected virtual void OnClipGUI(Rect rect) { }

        ///<summary>Override for extra clip GUI contents outside of clip.</summary>
        protected virtual void OnClipGUIExternal(Rect left, Rect right) { }

        ///<summary>Override to validate things in editor.</summary>
        protected virtual void OnEditorValidate() { }

        ///----------------------------------------------------------------------------------------------
#endif
    }
}
