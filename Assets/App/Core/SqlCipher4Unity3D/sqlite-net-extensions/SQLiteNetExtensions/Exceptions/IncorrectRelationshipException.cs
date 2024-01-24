#region
using System;
#endregion

namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Exceptions
{
    public class IncorrectRelationshipException : Exception
    {
        public IncorrectRelationshipException(string typeName, string propertyName, string message)
                : base(string.Format("{0}.{1}: {2}", typeName, propertyName, message)) { }

        public string PropertyName { get; set; }
        public string TypeName { get; set; }
    }
}
