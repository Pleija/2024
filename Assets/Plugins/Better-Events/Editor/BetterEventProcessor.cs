#if UNITY_EDITOR


using BetterEvents;
using Sirenix.OdinInspector.Editor;
using System;
using System.Collections.Generic;

// This turns the BetterEventEntry.ParameterValues object array into properties in the inspector.

public class BetterEventProcessor : OdinPropertyProcessor<BetterEventEntry>
{
    public override void ProcessMemberProperties(List<InspectorPropertyInfo> propertyInfos) {
        var val = (BetterEventEntry) Property.ValueEntry.WeakSmartValue;
        if (val.Delegate == null) return;

        if (val.Delegate.Method == null) return;

        var ps = val.Delegate.Method.GetParameters();
        for (var i = 0; i < ps.Length; i++) {
            var p = ps[i];
            var getterSetterType = typeof(ArrayIndexGetterSetter<>).MakeGenericType(p.ParameterType);
            var getterSetter =
                Activator.CreateInstance(getterSetterType, new object[] { Property, i }) as IValueGetterSetter;

            var info = InspectorPropertyInfo.CreateValue(p.Name, i, SerializationBackend.Odin, getterSetter);
            propertyInfos.Add(info);
        }
    }

    class ArrayIndexGetterSetter<T> : IValueGetterSetter<object, T>
    {
        readonly InspectorProperty property;
        readonly int index;
        public bool IsReadonly => false;
        public Type OwnerType => typeof(object);
        public Type ValueType => typeof(T);

        public object[] parameterValues {
            get {
                var val = (BetterEventEntry) property.ValueEntry.WeakSmartValue;
                return val.ParameterValues;
            }
        }

        public ArrayIndexGetterSetter(InspectorProperty property, int index) {
            this.property = property;
            this.index = index;
        }

        public T GetValue(ref object owner) {
            var parms = parameterValues;
            if (parms == null || index >= parms.Length) return default;

            if (parms[index] == null) return default;

            try {
                return (T) parms[index];
            }
            catch {
                return default;
            }
        }

        public object GetValue(object owner) {
            var parms = parameterValues;
            if (parms == null || index >= parms.Length) return default(T);

            return parameterValues[index];
        }

        public void SetValue(ref object owner, T value) {
            var parms = parameterValues;
            if (parms == null || index >= parms.Length) return;

            parms[index] = value;
        }

        public void SetValue(object owner, object value) {
            var parms = parameterValues;
            if (parms == null || index >= parms.Length) return;

            parms[index] = value;
        }
    }
}
#endif
