#if UNITY_EDITOR


using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using Sirenix.Utilities.Editor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using UnityEngine;

public class MethodSelector : OdinSelector<DelegateInfo>
{
    HashSet<string> seenMethods = new HashSet<string>();
    UnityEngine.Object target = null;
    GameObject gameObjectTarget;
    OdinMenuStyle staticMethodMenuItemStyle;

    public MethodSelector(UnityEngine.Object obj) {
        target = obj;
        gameObjectTarget = target as GameObject;
        var component = target as Component;
        if (component) gameObjectTarget = component.gameObject;
    }

    protected override void DrawSelectionTree() {
        base.DrawSelectionTree();
    }

    protected override void BuildSelectionTree(OdinMenuTree tree) {
        // Setup
        tree.Config.DrawSearchToolbar = true;
        tree.Config.UseCachedExpandedStates = false;
        tree.Selection.SupportsMultiSelect = false;
        tree.Config.DefaultMenuStyle.IndentAmount += 13;
        staticMethodMenuItemStyle = tree.Config.DefaultMenuStyle.Clone();
        staticMethodMenuItemStyle.IconPadding = 0;
        staticMethodMenuItemStyle.Offset -= staticMethodMenuItemStyle.IconSize;

        // Add methods
        if (gameObjectTarget) {
            AddMethods(tree, typeof(GameObject), gameObjectTarget, Flags.InstancePublic);
            AddMethods(tree, typeof(GameObject), null, Flags.StaticAnyVisibility);
            var components = gameObjectTarget.GetComponents(typeof(Component));
            foreach (var c in components) {
                AddMethods(tree, c.GetType(), c, Flags.InstancePublic);
                AddMethods(tree, c.GetType(), null, Flags.StaticAnyVisibility);
            }
        }
        else if (target) {
            AddMethods(tree, target.GetType(), target, Flags.InstancePublic);
            AddMethods(tree, target.GetType(), null, Flags.StaticAnyVisibility);
        }
        else {
            // If there is no target provided then just show static methods from UnityEngine.Object?
            AddMethods(tree, typeof(UnityEngine.Object), null, Flags.StaticPublic);

            // Include others?
            // this.AddMethods(tree, typeof(UnityEngine.SceneManagement.SceneManager), null, Flags.StaticPublic);
        }

        // Add icons
        foreach (var item in tree.EnumerateTree()) {
            if (item.Value is DelegateInfo) continue;

            if (item.ChildMenuItems.Count == 0) continue;

            var child = item.ChildMenuItems[0];
            if (child.Value is DelegateInfo) {
                var del = (DelegateInfo) child.Value;
                item.IconGetter = () => GUIHelper.GetAssetThumbnail(null, del.Method.DeclaringType, true);
            }
        }

        // Expand first, if there is only one root menu item.
        if (tree.MenuItems.Count == 1) tree.MenuItems[0].Toggled = true;
    }

    public override bool IsValidSelection(IEnumerable<DelegateInfo> collection) {
        var info = collection.FirstOrDefault();
        return info.Method != null;
    }

    static string GetNiceShortMethodName(MethodInfo mi) {
        var paramNames = mi.GetParameters().Select(x => x.Name).ToArray();
        return mi.Name + "(" + string.Join(", ", paramNames) + ")";
    }

    static bool ShouldIncludeMethod(MethodInfo mi) {
        // Only include methods without a return-type.
        //if (mi.ReturnType != typeof(void)) return false;

        // No get properties!
        if (mi.ReturnType != typeof(void) && mi.IsSpecialName
            && mi.Name.StartsWith("get_")) return false; // There's probably a better way of doing this.

        // No generic methods.
        if (mi.IsGenericMethod) return false;

        // Exclude property set methods. (optional)
        // if (mi.IsSpecialName) return false;

        // Exclude obsolete methods? This could maybe be made a warning icon on the menu item instead.
        if (mi.GetAttribute<ObsoleteAttribute>() != null) return false;

        // Internal Unity methods.
        var o = mi.GetAttribute<MethodImplAttribute>();
        if (o != null && (o.Value & MethodImplOptions.InternalCall) != 0) return false;

        // We can't detect whether a member is internal or public. Luckily Unity use a naming convension.
        if ((mi.DeclaringType.Namespace ?? "").StartsWith("UnityEngine")
            && mi.Name.StartsWith("Internal", StringComparison.InvariantCultureIgnoreCase))
            return false;

        // Note: 
        // We can't filter out Extern methods. There are many important extern methods.
        return true;
    }

    void AddMethods(OdinMenuTree tree, Type type, UnityEngine.Object target, BindingFlags flags) {
        var methods = type.GetBaseClasses(true).SelectMany(x => x.GetMethods(flags));
        foreach (var mi in methods) {
            if (!ShouldIncludeMethod(mi)) continue;

            var path = mi.DeclaringType.GetNiceName() + "/" + GetNiceShortMethodName(mi);
            if (seenMethods.Add(path)) {
                var info = new DelegateInfo() { Target = target, Method = mi };
                var menuItem = tree.AddObjectAtPath(path, info).Last();
                menuItem.SearchString = path;
                if (mi.IsStatic) {
                    menuItem.Style = staticMethodMenuItemStyle;
                    menuItem.Icon = EditorIcons.StarPointer.Active;
                }
            }
        }
    }
}
#endif
