namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Attributes
{
    public class OneToManyAttribute : RelationshipAttribute
    {
        public OneToManyAttribute(string inverseForeignKey = null, string inverseProperty = null) :
            base(null, inverseForeignKey, inverseProperty) { }
    }
}
