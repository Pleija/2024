using System;
using System.Linq;
using System.Text;

public static class ExtensionsUtil
{
    public static string String(this byte[] bytes) => Encoding.UTF8.GetString(bytes);
    public static byte[] Bytes(this string str) => Encoding.UTF8.GetBytes(str);

    public static string MD5(this byte[] input) => string.Join("",
        System.Security.Cryptography.MD5.Create().ComputeHash(input).Select(x => x.ToString("x2")));

    public static string MD5(this string input) => MD5(input.Bytes());
}
