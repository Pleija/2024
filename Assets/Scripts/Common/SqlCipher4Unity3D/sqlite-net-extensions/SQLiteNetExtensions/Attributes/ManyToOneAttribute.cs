namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Attributes
{
    public class ManyToOneAttribute: RelationshipAttribute
    {
        public ManyToOneAttribute(string foreignKey = null, string inverseProperty = null): base(foreignKey,
            null, inverseProperty) { }
    }
}
