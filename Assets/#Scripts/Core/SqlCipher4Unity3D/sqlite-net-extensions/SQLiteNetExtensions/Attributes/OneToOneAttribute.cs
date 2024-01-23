namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Attributes
{
    public class OneToOneAttribute : RelationshipAttribute
    {
        public OneToOneAttribute(string foreignKey = null, string inverseProperty = null) : base(
            foreignKey, null, inverseProperty) { }
    }
}
