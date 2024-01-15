using System;

namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Extensions.TextBlob
{
    public interface ITextBlobSerializer
    {
        string Serialize(object element);

        object Deserialize(string text, Type type);
    }
}
