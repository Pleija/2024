#if UNITY_EDITOR

#region
using System.Reflection;
using UnityEngine;
#endregion

namespace ParadoxNotion.Design
{
    /// <summary>
    ///     Contains info about inspected field rin regards to reflected inspector and
    ///     object/attribute drawers
    /// </summary>
    public struct InspectedFieldInfo
    {
        ///<summary>The field inspected</summary>
        public FieldInfo field;

        ///<summary>the unityengine object serialization context</summary>
        public Object unityObjectContext;

        ///<summary>the parent instance the field lives within</summary>
        public object parentInstanceContext;

        /// <summary>
        ///     In case instance lives in wrapped context (eg lists) otherwise the same as
        ///     parentInstanceContext
        /// </summary>
        public object wrapperInstanceContext;

        ///<summary>attributes found on field</summary>
        public object[] attributes;

        //...
        public InspectedFieldInfo(Object unityObjectContext, FieldInfo field,
            object parentInstanceContext, object[] attributes)
        {
            this.unityObjectContext = unityObjectContext;
            this.field = field;
            this.parentInstanceContext = parentInstanceContext;
            wrapperInstanceContext = parentInstanceContext;
            this.attributes = attributes;
        }
    }
}

#endif
