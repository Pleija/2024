using System;
using System.Linq;
using System.Text;
using Api;

public static class ExtensionsUtil
{
    public static string String(this byte[] bytes) => Encoding.UTF8.GetString(bytes);
    public static byte[] Bytes(this string str) => Encoding.UTF8.GetBytes(str);

    public static byte[] Bytes(this object str) =>
        str is byte[] bytes ? bytes : Encoding.UTF8.GetBytes(str.ToString());

    public static string MD5(this byte[] input, params object[] other) => string.Join("",
        System.Security.Cryptography.MD5.Create().ComputeHash((input.String() + string.Join("",
                other.Append(NetConfig.salt)
                    .Select(x => x is byte[] bytes ? bytes.String() : x.ToString()))).Bytes())
            .Select(x => x.ToString("x2")));

    public static string MD5(this object input, params object[] other) =>
        MD5(input.ToString().Bytes(), other);
}
