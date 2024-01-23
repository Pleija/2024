/**********************************************************\
|                                                          |
| XXTEA.cs                                                 |
|                                                          |
| XXTEA encryption algorithm library for .NET.             |
|                                                          |
| Encryption Algorithm Authors:                            |
|      David J. Wheeler                                    |
|      Roger M. Needham                                    |
|                                                          |
| Code Author:  Ma Bingyao <mabingyao@gmail.com>           |
| LastModified: Mar 10, 2015                               |
|                                                          |
\**********************************************************/

using System;
using System.Text;

public sealed class XXTEA
{
    public static string Key = "2E52766A-2B1D-4783-A80E-15E0E2609CAB";
    private static readonly UTF8Encoding utf8 = new UTF8Encoding();
    private const uint delta = 0x9E3779B9;

    private static uint MX(uint sum, uint y, uint z, int p, uint e, uint[] k) =>
        (((z >> 5) ^ (y << 2)) + ((y >> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z));

    private XXTEA() { }

    public static byte[] Encrypt(byte[] data, byte[] key)
    {
        if (data.Length == 0) return data;
        return ToByteArray(Encrypt(ToUInt32Array(data, true), ToUInt32Array(FixKey(key), false)),
            false);
    }

    public static byte[] Encrypt(string data, byte[] key) => Encrypt(utf8.GetBytes(data), key);
    public static byte[] Encrypt(byte[] data, string key) => Encrypt(data, utf8.GetBytes(key));

    public static byte[] Encrypt(string data, string key) =>
        Encrypt(utf8.GetBytes(data), utf8.GetBytes(key));

    public static string EncryptToBase64String(byte[] data, byte[] key) =>
        Convert.ToBase64String(Encrypt(data, key));

    public static string EncryptToBase64String(string data, byte[] key) =>
        Convert.ToBase64String(Encrypt(data, key));

    public static string EncryptToBase64String(byte[] data, string key) =>
        Convert.ToBase64String(Encrypt(data, key));

    public static string EncryptToBase64String(byte[] data) =>
        Convert.ToBase64String(Encrypt(data, Key));

    public static string EncryptToBase64String(string data, string key) =>
        Convert.ToBase64String(Encrypt(data, key));

    public static string EncryptToBase64String(string data) =>
        Convert.ToBase64String(Encrypt(data, Key));

    public static byte[] Decrypt(byte[] data, byte[] key)
    {
        if (data.Length == 0) return data;
        return ToByteArray(Decrypt(ToUInt32Array(data, false), ToUInt32Array(FixKey(key), false)),
            true);
    }

    public static byte[] Decrypt(byte[] data, string key) => Decrypt(data, utf8.GetBytes(key));

    public static byte[] DecryptBase64String(string data, byte[] key) =>
        Decrypt(Convert.FromBase64String(data), key);

    public static byte[] DecryptBase64String(string data, string key) =>
        Decrypt(Convert.FromBase64String(data), key);

    public static string DecryptToString(byte[] data, byte[] key) =>
        utf8.GetString(Decrypt(data, key));

    public static string DecryptToString(byte[] data, string key) =>
        utf8.GetString(Decrypt(data, key));

    public static string DecryptBase64StringToString(string data, byte[] key) =>
        utf8.GetString(DecryptBase64String(data, key));

    public static string DecryptBase64StringToString(string data, string key) =>
        utf8.GetString(DecryptBase64String(data, key));

    public static string DecryptBase64StringToString(string data) =>
        utf8.GetString(DecryptBase64String(data, Key));

    private static uint[] Encrypt(uint[] v, uint[] k)
    {
        var n = v.Length - 1;
        if (n < 1) return v;
        uint z = v[n], y, sum = 0, e;
        int p, q = 6 + 52 / (n + 1);

        unchecked {
            while (0 < q--) {
                sum += delta;
                e = (sum >> 2) & 3;

                for (p = 0; p < n; p++) {
                    y = v[p + 1];
                    z = v[p] += MX(sum, y, z, p, e, k);
                }
                y = v[0];
                z = v[n] += MX(sum, y, z, p, e, k);
            }
        }
        return v;
    }

    private static uint[] Decrypt(uint[] v, uint[] k)
    {
        var n = v.Length - 1;
        if (n < 1) return v;
        uint z, y = v[0], sum, e;
        int p, q = 6 + 52 / (n + 1);

        unchecked {
            sum = (uint)(q * delta);

            while (sum != 0) {
                e = (sum >> 2) & 3;

                for (p = n; p > 0; p--) {
                    z = v[p - 1];
                    y = v[p] -= MX(sum, y, z, p, e, k);
                }
                z = v[n];
                y = v[0] -= MX(sum, y, z, p, e, k);
                sum -= delta;
            }
        }
        return v;
    }

    private static byte[] FixKey(byte[] key)
    {
        if (key.Length == 16) return key;
        var fixedkey = new byte[16];
        if (key.Length < 16)
            key.CopyTo(fixedkey, 0);
        else
            Array.Copy(key, 0, fixedkey, 0, 16);
        return fixedkey;
    }

    private static uint[] ToUInt32Array(byte[] data, bool includeLength)
    {
        var length = data.Length;
        var n = (length & 3) == 0 ? length >> 2 : (length >> 2) + 1;
        uint[] result;

        if (includeLength) {
            result = new uint[n + 1];
            result[n] = (uint)length;
        }
        else {
            result = new uint[n];
        }
        for (var i = 0; i < length; i++) result[i >> 2] |= (uint)data[i] << ((i & 3) << 3);
        return result;
    }

    private static byte[] ToByteArray(uint[] data, bool includeLength)
    {
        var n = data.Length << 2;

        if (includeLength) {
            var m = (int)data[data.Length - 1];
            n -= 4;
            if (m < n - 3 || m > n) return null;
            n = m;
        }
        var result = new byte[n];
        for (var i = 0; i < n; i++) result[i] = (byte)(data[i >> 2] >> ((i & 3) << 3));
        return result;
    }
}
