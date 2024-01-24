﻿#region
using System;
#endregion

namespace NodeCanvas.Framework
{
    ///<summary>An attribute to help with URLs in the welcome window. Thats all.</summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class GraphInfoAttribute : Attribute
    {
        public string docsURL;
        public string forumsURL;
        public string packageName;
        public string resourcesURL;
    }

    /// <summary>
    ///     Used on top of IGraphAssignable nodes to specify the target type for DragDrop operations It can
    ///     be used on top
    ///     of other node types if the graph checks for that (see
    ///     GraphEditorUtility.GetDropedReferenceNodeTypes)
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class DropReferenceType : Attribute
    {
        public readonly Type type;
        public DropReferenceType(Type type) => this.type = type;
    }

    ///<summary>Marks the BBParameter possible to only pick values from a blackboard.</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class BlackboardOnlyAttribute : Attribute { }
}
