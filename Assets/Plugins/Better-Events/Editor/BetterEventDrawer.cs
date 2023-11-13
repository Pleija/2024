#if UNITY_EDITOR


using BetterEvents;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using Sirenix.Utilities.Editor;
using System;
using System.Linq;
using UnityEditor;
using UnityEngine;

public class BetterEventDrawer : OdinValueDrawer<BetterEventEntry>
{
    UnityEngine.Object tmpTarget;

    protected override void DrawPropertyLayout(GUIContent label) {
        SirenixEditorGUI.BeginBox();
        {
            SirenixEditorGUI.BeginToolbarBoxHeader();
            {
                var rect = GUILayoutUtility.GetRect(0, 19);
                var unityObjectFieldRect = rect.Padding(2).AlignLeft(rect.width / 2);
                var methodSelectorRect = rect.Padding(2).AlignRight(rect.width / 2 - 5);
                var dInfo = GetDelegateInfo();
                EditorGUI.BeginChangeCheck();
                var newTarget = SirenixEditorFields.UnityObjectField(unityObjectFieldRect, dInfo.Target,
                    typeof(UnityEngine.Object), true);

                if (EditorGUI.EndChangeCheck()) tmpTarget = newTarget;

                EditorGUI.BeginChangeCheck();
                var selectorText = dInfo.Method == null || tmpTarget ? "Select a method" : dInfo.Method.Name;
                var newMethod = MethodSelector.DrawSelectorDropdown(methodSelectorRect, selectorText, CreateSelector);

                if (EditorGUI.EndChangeCheck()) {
                    CreateAndAssignNewDelegate(newMethod.FirstOrDefault());
                    tmpTarget = null;
                }
            }

            SirenixEditorGUI.EndToolbarBoxHeader();

            // Draws the rest of the ICustomEvent, and since we've drawn the label, we simply pass along null.
            for (var i = 0; i < Property.Children.Count; i++) {
                var child = Property.Children[i];
                if (child.Name == "Result") continue;

                child.Draw();
            }
        }

        SirenixEditorGUI.EndBox();
    }

    void CreateAndAssignNewDelegate(DelegateInfo delInfo) {
        var method = delInfo.Method;
        var target = delInfo.Target;
        var pTypes = method.GetParameters().Select(x => x.ParameterType).ToArray();
        var args = new object[pTypes.Length];
        Type delegateType = null;
        if (method.ReturnType == typeof(void)) {
            if (args.Length == 0)
                delegateType = typeof(Action);
            else if (args.Length == 1)
                delegateType = typeof(Action<>).MakeGenericType(pTypes);
            else if (args.Length == 2)
                delegateType = typeof(Action<,>).MakeGenericType(pTypes);
            else if (args.Length == 3)
                delegateType = typeof(Action<,,>).MakeGenericType(pTypes);
            else if (args.Length == 4)
                delegateType = typeof(Action<,,,>).MakeGenericType(pTypes);
            else if (args.Length == 5) delegateType = typeof(Action<,,,,>).MakeGenericType(pTypes);
        }
        else {
            pTypes = pTypes.Append(method.ReturnType).ToArray();
            if (args.Length == 0)
                delegateType = typeof(Func<>).MakeArrayType();
            else if (args.Length == 1)
                delegateType = typeof(Func<,>).MakeGenericType(pTypes);
            else if (args.Length == 2)
                delegateType = typeof(Func<,,>).MakeGenericType(pTypes);
            else if (args.Length == 3)
                delegateType = typeof(Func<,,,>).MakeGenericType(pTypes);
            else if (args.Length == 4)
                delegateType = typeof(Func<,,,,>).MakeGenericType(pTypes);
            else if (args.Length == 5) delegateType = typeof(Func<,,,,,>).MakeGenericType(pTypes);
        }

        if (delegateType == null) {
            Debug.LogError("Unsupported Method Type");
            return;
        }

        var del = Delegate.CreateDelegate(delegateType, target, method);
        Property.Tree.DelayActionUntilRepaint(() => {
            ValueEntry.WeakSmartValue = new BetterEventEntry(del);
            GUI.changed = true;
            Property.RefreshSetup();
        });
    }

    DelegateInfo GetDelegateInfo() {
        var value = ValueEntry.SmartValue;
        var del = value.Delegate;
        var methodInfo = del == null ? null : del.Method;
        UnityEngine.Object target = null;
        if (tmpTarget)
            target = tmpTarget;
        else if (del != null) target = del.Target as UnityEngine.Object;

        return new DelegateInfo() { Target = target, Method = methodInfo };
    }

    OdinSelector<DelegateInfo> CreateSelector(Rect arg) {
        arg.xMin -= arg.width;
        var info = GetDelegateInfo();
        var sel = new MethodSelector(info.Target);
        sel.SetSelection(info);
        sel.ShowInPopup(arg);
        return sel;
    }
}
#endif
