#region
using System;
using System.Reflection;
#endregion

namespace ParadoxNotion.Serialization.FullSerializer
{
    ///<summary> A field on a MetaType.</summary>
    public class fsMetaProperty
    {
        internal fsMetaProperty(FieldInfo field)
        {
            Field = field;
            var attr = Field.RTGetAttribute<fsSerializeAsAttribute>(true);
            JsonName = attr != null && !string.IsNullOrEmpty(attr.Name) ? attr.Name : field.Name;
            ReadOnly = Field.RTIsDefined<fsReadOnlyAttribute>(true);
            WriteOnly = Field.RTIsDefined<fsWriteOnlyAttribute>(true);
            var autoInstanceAtt = StorageType.RTGetAttribute<fsAutoInstance>(true);
            AutoInstance = autoInstanceAtt != null
                    && autoInstanceAtt.makeInstance
                    && !StorageType.IsAbstract;
            AsReference = Field.RTIsDefined<fsSerializeAsReference>(true);
        }

        ///<summary> Internal handle to the reflected member.</summary>
        public FieldInfo Field { get; private set; }

        ///<summary> The serialized name of the property, as it should appear in JSON.</summary>
        public string JsonName { get; private set; }

        ///<summary> The type of value that is stored inside of the property.</summary>
        public Type StorageType => Field.FieldType;

        ///<summary> The real name of the member info.</summary>
        public string MemberName => Field.Name;

        ///<summary> Is the property read only?</summary>
        public bool ReadOnly { get; private set; }

        ///<summary> Is the property write only?</summary>
        public bool WriteOnly { get; private set; }

        ///<summary> Make instance automatically?</summary>
        public bool AutoInstance { get; private set; }

        ///<summary> Serialize as reference?</summary>
        public bool AsReference { get; private set; }

        /// <summary>
        ///     Reads a value from the property that this MetaProperty represents, using the given object
        ///     instance as the
        ///     context.
        /// </summary>
        public object Read(object context) => Field.GetValue(context);

        /// <summary>
        ///     Writes a value to the property that this MetaProperty represents, using given object
        ///     instance as the context.
        /// </summary>
        public void Write(object context, object value)
        {
            Field.SetValue(context, value);
        }
    }
}
