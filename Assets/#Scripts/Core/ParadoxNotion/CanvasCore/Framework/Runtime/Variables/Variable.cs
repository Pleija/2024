﻿using System;
using System.Reflection;
using ParadoxNotion;
using ParadoxNotion.Serialization;
using ParadoxNotion.Serialization.FullSerializer;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
using UnityEngine;
using UnityEngine.AddressableAssets;
using Logger = ParadoxNotion.Services.Logger;

namespace NodeCanvas.Framework
{
#if UNITY_EDITOR //handles missing variable types
    [fsObject(Processor = typeof(fsRecoveryProcessor<Variable, MissingVariableType>)), Serializable,
     fsUninitialized, SpoofAOT]
#endif
    ///<summary>Variables are stored in Blackboards and can optionaly be bound to Properties or Fields of a Unity Component</summary>
    public abstract class Variable
    {
        [SerializeField]
        private string _name;

        [SerializeField]
        private string _id;

        [SerializeField]
        private bool _isPublic;

        [SerializeField, fsIgnoreInBuild]
        private bool _debugBoundValue;

        [SerializeField]
        public AssetObject assetObject;

        ///<summary>Raised when name change</summary>
        public event Action<string> onNameChanged;

        ///<summary>Raised when value change</summary>
        public event Action<object> onValueChanged;

        ///<summary>Raised when variable is destroyed/removed from blackboard</summary>
        public event Action onDestroy;

        ///<summary>The name of the variable</summary>
        public string name {
            get => _name;
            set {
                if (_name != value) {
                    _name = value;
                    if (onNameChanged != null) onNameChanged(value);
                }
            }
        }

        ///<summary>A Unique ID</summary>
        public string ID => string.IsNullOrEmpty(_id) ? _id = Guid.NewGuid().ToString() : _id;

        ///<summary>The value as object type when accessing from base class</summary>
        public object value {
            get => GetValueBoxed();
            set => SetValueBoxed(value);
        }

        ///<summary>Is the variable exposed public?</summary>
        public bool isExposedPublic {
            get => _isPublic && !isPropertyBound;
            set => _isPublic = value;
        }

        ///<summary>For debugging data bound value in inspector (editor only)</summary>
        public bool debugBoundValue {
            get => _debugBoundValue;
            set => _debugBoundValue = value;
        }

        ///<summary>Is the variable bound to a property/field?</summary>
        public bool isPropertyBound => !string.IsNullOrEmpty(propertyPath);

        ///<summary>Is the variable data bound now?</summary>
        public abstract bool isDataBound { get; }

        protected Type _type;

        ///<summary>The Type this Variable holds</summary>
        public virtual Type varType {
            get => _type;
            set => _type = value;
        }

        ///<summary>The path to the property this data is binded to. Null if none</summary>
        public abstract string propertyPath { get; set; }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Used to bind variable to a property</summary>
        public abstract void BindProperty(MemberInfo prop, GameObject target = null);

        ///<summary>Used to un-bind variable from a property</summary>
        public abstract void UnBind();

        ///<summary>Called from Blackboard in Awake to Initialize the binding on specified game object</summary>
        public abstract void InitializePropertyBinding(GameObject go, bool callSetter = false);

        ///<summary>Same as .value. Used for binding.</summary>
        public abstract object GetValueBoxed();

        ///<summary>Same as .value. Used for binding.</summary>
        public abstract void SetValueBoxed(object value);

        ///----------------------------------------------------------------------------------------------

        //required
        public Variable() => _id = Guid.NewGuid().ToString();

        public Variable(string name, string ID)
        {
            _name = name;
            _id = ID;
        }

        //...
        internal void OnDestroy()
        {
            if (onDestroy != null) onDestroy();
        }

        ///<summary>Duplicate this Variable into target Blackboard</summary>
        public Variable Duplicate(IBlackboard targetBB)
        {
            var finalName = name;
            while (targetBB.variables.ContainsKey(finalName)) finalName += ".";
            var newVar = targetBB.AddVariable(finalName, varType);

            if (newVar != null) {
                newVar.value = value;
                newVar.propertyPath = propertyPath;
                newVar.isExposedPublic = isExposedPublic;
            }
            return newVar;
        }

        //we need this since onValueChanged is an event and we can't check != null outside of this class
        protected bool HasValueChangeEvent() => onValueChanged != null;

        //invoke value changed event
        protected void TryInvokeValueChangeEvent(object value)
        {
            if (onValueChanged != null) onValueChanged(value);
        }

        ///<summary>Checks whether a convertion to type is possible</summary>
        public bool CanConvertTo(Type toType) => GetGetConverter(toType) != null;

        ///<summary>Gets a Func<object> that converts the value ToType if possible. Null if not.</summary>
        public Func<object> GetGetConverter(Type toType)
        {
            if (toType.RTIsAssignableFrom(varType)) return () => value;
            var converter = TypeConverter.Get(varType, toType);
            if (converter != null) return () => converter(value);
            return null;
        }

        ///<summary>Checks whether a convertion from type is possible</summary>
        public bool CanConvertFrom(Type fromType) => GetSetConverter(fromType) != null;

        /// <summary>
        ///     Gets an Action<object> that converts the value fromType if possible. Null if not.
        /// </summary>
        public Action<object> GetSetConverter(Type fromType)
        {
            if (varType.RTIsAssignableFrom(fromType)) return (x) => value = x;
            var converter = TypeConverter.Get(fromType, varType);
            if (converter != null) return (x) => value = converter(x);
            return null;
        }

        //...
        public override string ToString() => name;
    }

    ///----------------------------------------------------------------------------------------------
    ///<summary>The actual Variable</summary>
    public class Variable<T> : Variable
    {
        [SerializeField]
        private T _value;

        [SerializeField]
        private string _propertyPath;

        //delegates for binding
        private event Func<T> getter;
        private event Action<T> setter;

        //
        public override Type varType {
            get => _type ?? typeof(T);
            set => _type = value;
        }

        public override bool isDataBound => getter != null || setter != null;

        public override string propertyPath {
            get => _propertyPath;
            set => _propertyPath = value;
        }

        ///<summary>The value as type T when accessing as this type</summary>
        public new T value {
            get {
                if (typeof(T) == typeof(AssetReference) && assetObject)
                    _value = (T)(object)assetObject.Reference;
                return getter != null ? getter() : _value;
            }
            set {
                if (HasValueChangeEvent()) {
                    //check this first to avoid unescessary value boxing
                    var boxed = (object)value;

                    if (!ObjectUtils.AnyEquals(_value, boxed)) {
                        _value = value;
                        if (setter != null) setter(value);
                        TryInvokeValueChangeEvent(boxed);
                    }
                    return;
                }
                _value = value;
                if (typeof(T) == typeof(AssetReference) && assetObject)
                    assetObject.Reference = (AssetReference)(object)value;
                if (setter != null) setter(value);
            }
        }

        ///----------------------------------------------------------------------------------------------

        //required
        public Variable() { }

        public Variable(string name) : base(name, Guid.NewGuid().ToString()) { }
        public Variable(string name, string ID) : base(name, ID) { }

        public Variable(string name, Type type) : base(name, Guid.NewGuid().ToString()) =>
            varType = type;

        ///<summary>Same as .value. Used for binding.</summary>
        public override object GetValueBoxed() =>
            //Debug.Log(typeof(T).Name);
            value;

        ///<summary>Same as .value. Used for binding.</summary>
        public override void SetValueBoxed(object newValue)
        {
            value = (T)newValue;
        }

        ///<summary>Same as .value. Used for binding.</summary>
        public T GetValue() => value;

        ///<summary>Same as .value. Used for binding.</summary>
        public void SetValue(T newValue)
        {
            value = newValue;
        }

        ///<summary>Set the property binding. Providing target also initializes the property binding</summary>
        public override void BindProperty(MemberInfo prop, GameObject target = null)
        {
            if (prop is PropertyInfo || prop is FieldInfo) {
                _propertyPath = string.Format("{0}.{1}", prop.RTReflectedOrDeclaredType().FullName,
                    prop.Name);
                if (target != null) InitializePropertyBinding(target, false);
            }
        }

        ///<summary>Bind getter and setter directly</summary>
        public void BindGetSet(Func<T> _get, Action<T> _set)
        {
            getter = _get;
            setter = _set;
        }

        ///<summary>Removes the property and data binding</summary>
        public override void UnBind()
        {
            _propertyPath = null;
            getter = null;
            setter = null;
        }

        /// <summary>
        ///     Initialize the property binding for target gameobject. The gameobject is only used in case the
        ///     binding is not
        ///     static.
        /// </summary>
        public override void InitializePropertyBinding(GameObject go, bool callSetter = false)
        {
            if (!isPropertyBound || !ParadoxNotion.Services.Threader.applicationIsPlaying) return;
            getter = null;
            setter = null;
            var idx = _propertyPath.LastIndexOf('.');
            var typeString = _propertyPath.Substring(0, idx);
            var memberString = _propertyPath.Substring(idx + 1);
            var type = ReflectionTools.GetType(typeString, /*fallback?*/ true, typeof(Component));

            if (type == null) {
                Logger.LogError(
                    string.Format("Type '{0}' not found for Blackboard Variable '{1}' Binding.",
                        typeString, name), LogTag.VARIABLE, go);
                return;
            }
            var member = type.RTGetFieldOrProp(memberString);

            if (member is FieldInfo) {
                var field = (FieldInfo)member;
                var instance = field.IsStatic ? null : go.GetComponent(type);

                if (instance == null && !field.IsStatic) {
                    Logger.LogError(
                        string.Format(
                            "A Blackboard Variable '{0}' is due to bind to a Component type that is missing '{1}'. Binding ignored",
                            name, typeString), LogTag.VARIABLE, go);
                    return;
                }

                if (field.IsConstant()) {
                    var value = (T)field.GetValue(instance);
                    getter = () => {
                        return value;
                    };
                }
                else {
                    getter = () => {
                        return (T)field.GetValue(instance);
                    };
                    setter = (o) => {
                        field.SetValue(instance, o);
                    };
                }
                return;
            }

            if (member is PropertyInfo) {
                var prop = (PropertyInfo)member;
                var getMethod = prop.RTGetGetMethod();
                var setMethod = prop.RTGetSetMethod();
                var isStatic = (getMethod != null && getMethod.IsStatic) ||
                    (setMethod != null && setMethod.IsStatic);
                var instance = isStatic ? null : go.GetComponent(type);

                if (instance == null && !isStatic) {
                    Logger.LogError(
                        string.Format(
                            "A Blackboard Variable '{0}' is due to bind to a Component type that is missing '{1}'. Binding ignored.",
                            name, typeString), LogTag.VARIABLE, go);
                    return;
                }

                if (prop.CanRead && getMethod != null)
                    try {
                        getter = getMethod.RTCreateDelegate<Func<T>>(instance);
                    } //JIT
                    catch {
                        getter = () => {
                            return (T)getMethod.Invoke(instance, null);
                        };
                    } //AOT
                else
                    getter = () => {
                        Logger.LogError(
                            string.Format(
                                "You tried to Get a Property Bound Variable '{0}', but the Bound Property '{1}' is Write Only!",
                                name, _propertyPath), LogTag.VARIABLE, go);
                        return default;
                    };

                if (prop.CanWrite && setMethod != null) {
                    try {
                        setter = setMethod.RTCreateDelegate<Action<T>>(instance);
                    } //JIT
                    catch {
                        setter = (o) => {
                            setMethod.Invoke(instance, ReflectionTools.SingleTempArgsArray(o));
                        };
                    } //AOT
                    if (callSetter) setter(_value);
                }
                else {
                    setter = (o) => {
                        Logger.LogError(
                            string.Format(
                                "You tried to Set a Property Bound Variable '{0}', but the Bound Property '{1}' is Read Only!",
                                name, _propertyPath), LogTag.VARIABLE, go);
                    };
                }
                return;
            }
            Logger.LogError(
                string.Format(
                    "A Blackboard Variable '{0}' is due to bind to a property/field named '{1}' that does not exist on type '{2}'. Binding ignored",
                    name, memberString, type.FullName), LogTag.VARIABLE, go);
        }
    }
}
