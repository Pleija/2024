using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEngine;

namespace Hefty.EditorExtension
{
    internal static class SerializedPropExtension
    {
#region Simple string path based extensions
        /// <summary>
        ///     Returns the path to the parent of a SerializedProperty
        /// </summary>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static string ParentPath(this SerializedProperty prop)
        {
            var lastDot = prop.propertyPath.LastIndexOf('.');
            if (lastDot == -1) // No parent property
                return "";
            return prop.propertyPath.Substring(0, lastDot);
        }

        /// <summary>
        ///     Returns the parent of a SerializedProperty, as another SerializedProperty
        /// </summary>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static SerializedProperty GetParentProp(this SerializedProperty prop)
        {
            var parentPath = prop.ParentPath();
            return prop.serializedObject.FindProperty(parentPath);
        }
#endregion

        /// <summary>
        ///     Set isExpanded of the SerializedProperty and propogate the change up the hierarchy
        /// </summary>
        /// <param name="prop"></param>
        /// <param name="expand">isExpanded value</param>
        public static void ExpandHierarchy(this SerializedProperty prop, bool expand = true)
        {
            prop.isExpanded = expand;
            var parent = GetParentProp(prop);
            if (parent != null)
                ExpandHierarchy(parent);
        }

#region Reflection based extensions
        // http://answers.unity3d.com/questions/425012/get-the-instance-the-serializedproperty-belongs-to.html

        /// <summary>
        ///     Use reflection to get the actual data instance of a SerializedProperty
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static object GetValue<T>(this SerializedProperty prop)
        {
            var path = prop.propertyPath.Replace(".Array.data[", "[");
            object obj = prop.serializedObject.targetObject;
            var elements = path.Split('.');

            foreach (var element in elements)
                if (element.Contains("[")) {
                    var elementName = element.Substring(0, element.IndexOf("["));
                    var index = Convert.ToInt32(element.Substring(element.IndexOf("[")).Replace("[", "")
                        .Replace("]", ""));
                    obj = GetValue(obj, elementName, index);
                }
                else {
                    obj = GetValue(obj, element);
                }
            if (obj is T)
                return obj;
            return null;
        }

        public static Type GetTypeReflection(this SerializedProperty prop)
        {
            var obj = GetParent<object>(prop);
            if (obj == null)
                return null;
            var objType = obj.GetType();
            const BindingFlags bindingFlags = BindingFlags.GetField | BindingFlags.GetProperty | BindingFlags.Instance |
                BindingFlags.NonPublic | BindingFlags.Public;
            var field = objType.GetField(prop.name, bindingFlags);
            if (field == null)
                return null;
            return field.FieldType;
        }

        /// <summary>
        ///     Uses reflection to get the actual data instance of the parent of a SerializedProperty
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static T GetParent<T>(this SerializedProperty prop)
        {
            var path = prop.propertyPath.Replace(".Array.data[", "[");
            object obj = prop.serializedObject.targetObject;
            var elements = path.Split('.');

            foreach (var element in elements.Take(elements.Length - 1))
                if (element.Contains("[")) {
                    var elementName = element.Substring(0, element.IndexOf("["));
                    var index = Convert.ToInt32(element.Substring(element.IndexOf("[")).Replace("[", "")
                        .Replace("]", ""));
                    obj = GetValue(obj, elementName, index);
                }
                else {
                    obj = GetValue(obj, element);
                }
            return (T)obj;
        }

        private static object GetValue(object source, string name)
        {
            if (source == null)
                return null;
            var type = source.GetType();
            var f = type.GetField(name, BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance);

            if (f == null) {
                var p = type.GetProperty(name,
                    BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (p == null)
                    return null;
                return p.GetValue(source, null);
            }
            return f.GetValue(source);
        }

        private static object GetValue(object source, string name, int index)
        {
            var enumerable = GetValue(source, name) as IEnumerable;
            if (enumerable == null)
                return null;
            var enm = enumerable.GetEnumerator();
            while (index-- >= 0)
                enm.MoveNext();
            return enm.Current;
        }

        /// <summary>
        ///     Use reflection to check if SerializedProperty has a given attribute
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static bool HasAttribute<T>(this SerializedProperty prop)
        {
            var attributes = GetAttributes<T>(prop);
            if (attributes != null) return attributes.Length > 0;
            return false;
        }

        public static string FindAllProperty(this ScriptableObject target)
        {
            using var so = new SerializedObject(target);
            var iterator = so.GetIterator();
            var sb = new StringBuilder();
            sb.AppendLine("Visible Internal Properties:");

            // GetIterator returns a root that is above all others (depth -1)
            // so first property is found by stepping into the children
            var visitChildren = true;
            iterator.NextVisible(visitChildren);

            // For rest of scan stay at the same level (depth 0)
            visitChildren = false;

            do {
                if (iterator.name == "m_FirstField")
                    break; // Found first field from the C# object
                sb.AppendLine($"\t{iterator.name}");
            } while (iterator.NextVisible(visitChildren));

            // Repeat, using "Next" to show the hidden properties as well as visible
            sb.AppendLine("All Internal Properties:");
            iterator.Reset();
            visitChildren = true;
            iterator.Next(visitChildren);
            visitChildren = false;

            do {
                if (iterator.name == "m_FirstField")
                    break;
                sb.AppendLine($"\t{iterator.name}");
            } while (iterator.Next(visitChildren));
            return sb.ToString();
        }

        /// <summary>
        ///     Use reflection to get the attributes of the SerializedProperty
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static object[] GetAttributes<T>(this SerializedProperty prop)
        {
            var obj = GetParent<object>(prop);
            if (obj == null)
                return new object[0];
            var attrType = typeof(T);
            var objType = obj.GetType();
            const BindingFlags bindingFlags = BindingFlags.GetField | BindingFlags.GetProperty | BindingFlags.Instance |
                BindingFlags.NonPublic | BindingFlags.Public;
            var field = objType.GetField(prop.name, bindingFlags);
            if (field != null)
                return field.GetCustomAttributes(attrType, true);
            return new object[0];
        }

        /// <summary>
        ///     Find properties in the serialized object of the given type.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="enterChildren"></param>
        /// <returns></returns>
        public static SerializedProperty[] FindPropsOfType<T>(this SerializedObject obj, bool enterChildren = false)
        {
            var foundProps = new List<SerializedProperty>();
            var propType = typeof(T);
            var iterProp = obj.GetIterator();
            iterProp.Next(true);

            if (iterProp.NextVisible(enterChildren))
                do {
                    var propValue = iterProp.GetValue<T>();

                    if (propValue == null) {
                        if (iterProp.propertyType == SerializedPropertyType.ObjectReference)
                            if (iterProp.objectReferenceValue != null &&
                                iterProp.objectReferenceValue.GetType() == propType)
                                foundProps.Add(iterProp.Copy());
                    }
                    else {
                        foundProps.Add(iterProp.Copy());
                    }
                } while (iterProp.NextVisible(enterChildren));
            return foundProps.ToArray();
        }
#endregion
    }
}
