#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using TMPro;
using UniRx;
using UnityEngine;
using UnityEngine.Assertions;
using UnityEngine.UI;
#endregion

namespace App
{
    [DefaultExecutionOrder(-1)]
    public class DataAgent<T> : BehaviourBase
    {
        [ReadOnly]
        public ReactiveProperty<T> Value;

        // [ReadOnly]
        // public T value;
        public int Id = 1;
        public DbTable model;
        public Func<object, object> OnChange;

        [ValueDropdown(nameof(ListTypes))]
        public Type type;

        [ValueDropdown(nameof(ListNames))]
        public string fieldName;

        private IEnumerable<Type> ListTypes => AppDomain.CurrentDomain.GetAssemblies()
                .Where(a => !a.IsDynamic)
                .SelectMany(x => x.ExportedTypes.Where(a =>
                        typeof(DbTable).IsAssignableFrom(a)
                        && !a.IsAbstract
                        && !a.IsGenericType));

        private IEnumerable<string> ListNames => type == null ? new List<string>() : type
                .GetMembers(BindingFlags.Public | BindingFlags.Instance)
                .Where(x => x is PropertyInfo || x is FieldInfo)
                .Select(x => x.Name)
                .OrderBy(s => Regex.IsMatch(s, @"^[a-z]"))
                .ThenBy(x => x)
                .ToList();

        private void Start()
        {
            SetModel();
            SetValue();
        }

        [ButtonGroup("1")]
        public void SetModel()
        {
            Assert.IsNotNull(type, "type != null");
            if (model) model = model.GetSelf();
            if (!model)
                model = type.GetProperty("self",
                            BindingFlags.Static
                            | BindingFlags.FlattenHierarchy
                            | BindingFlags.Public)
                        ?.GetValue(null, null) as DbTable;
            Assert.IsNotNull(model, $"model: {type.FullName}.self == null");
        }

        [ButtonGroup("1")]
        public void SetValue()
        {
            if (model == null) return;

            // if(Value == null || Application.isEditor) {
            var member = type.GetMember(fieldName, BindingFlags.Instance | BindingFlags.Public)
                    .FirstOrDefault();
            if (member is PropertyInfo propertyInfo)
                Value = propertyInfo.GetValue(model) as ReactiveProperty<T>;
            else if (member is FieldInfo fieldInfo)
                Value = fieldInfo.GetValue(model) as ReactiveProperty<T>;
            // }
            if (Value == null) return;
            //Set(Value.Value);
            Value.Subscribe(x => {
                        Set(x);
                    })
                    .AddTo(this);
            //
            // if(Value != null) {
            //     value = Value.Value;
            // }
        }

        public void Set(object value)
        {
            if (!this || !gameObject) return;
            if (OnChange != null) value = OnChange.Invoke(value);
            if (TryGetComponent<TMP_Text>(out var tmpText))
                tmpText.text = $"{value}";
            else if (TryGetComponent<Text>(out var text))
                text.text = $"{value}";
            else if (TryGetComponent<Slider>(out var slider))
                slider.value = Convert.ToSingle(value);
            else if (TryGetComponent<Toggle>(out var toggle))
                toggle.isOn = Convert.ToBoolean(value);
        }
    }
}
