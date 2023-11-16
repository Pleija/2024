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
using Newtonsoft.Json;

// using UnityEngine;

public static partial class XJsonUtility
{
#region Json
    static readonly Byte[] bytes = {
        0x54,
        0x86,
        0x5B,
        0x40,
        0xF2,
        0x0B,
        0x62,
        0x44,
        0x93,
        0xE6,
        0xF7,
        0x7B,
        0x29,
        0x0F,
        0x24,
        0x9D,
    };

    public static string FromBase64(this string data)
    {
        if(string.IsNullOrWhiteSpace(data)) return data;
        var org = LZMAtools.DecompressLZMAByteArrayToByteArray(DecryptBase64String(data, bytes));
        return data.IsBase64()
            //? Encoding.UTF8.GetString(Convert.FromBase64String(data)) 
            ? utf8.GetString(org) : data; // DecryptBase64StringToString(org, bytes) : data;
    }

    public static bool IsBase64(this string base64String)
    {
        // Credit: oybek https://stackoverflow.com/users/794764/oybek
        if(string.IsNullOrEmpty(base64String) || base64String.Length % 4 != 0 ||
           base64String.Contains(" ") || base64String.Contains("\t") ||
           base64String.Contains("\r") || base64String.Contains("\n"))
            return false;

        try {
            Convert.FromBase64String(base64String);
            return true;
        }
        catch(Exception) {
            // Handle the exception
        }
        return false;
    }

    public static string ToBase64(this string data)
    {
        var org = LZMAtools.CompressByteArrayToLZMAByteArray(utf8.GetBytes(data));
        return EncryptToBase64String(org, bytes);
        //Convert.ToBase64String(Encoding.UTF8.GetBytes(data));
    }

    public static T FromJson<T>(string json)
    {
        var ret = JsonConvert.DeserializeObject<T>(json.FromBase64());
        return ret;
    }

    public static string ToJson(object value, bool pretty = false)
    {
        var ret = JsonConvert.SerializeObject(value).ToBase64();
        return ret;
    }

    public static object FromJson(string json, System.Type type)
    {
        var ret = JsonConvert.DeserializeObject(json.FromBase64(), type);
        return ret;
    }
#endregion

    private static readonly UTF8Encoding utf8 = new UTF8Encoding();
    private const uint delta = 0x9E3779B9;

    private static uint MX(uint sum, uint y, uint z, int p, uint e, uint[] k) =>
        (((z >> 5) ^ (y << 2)) + ((y >> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z));

    //private XXTEA() { }

    public static byte[] Encrypt(byte[] data, byte[] key = null)
    {
        key ??= bytes;
        if(data.Length == 0) return data;
        return ToByteArray(Encrypt(ToUInt32Array(data, true), ToUInt32Array(FixKey(key), false)),
            false);
    }

    public static byte[] Encrypt(string data, byte[] key = null) =>
        Encrypt(utf8.GetBytes(data), key ?? bytes);

    public static byte[] Encrypt(byte[] data, string key = null) => Encrypt(data,
        !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes);

    public static byte[] Encrypt(string data, string key) => Encrypt(utf8.GetBytes(data),
        !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes);

    public static string EncryptToBase64String(byte[] data, byte[] key = null) =>
        Convert.ToBase64String(Encrypt(data, key ?? bytes));

    public static string EncryptToBase64String(object data, byte[] key) =>
        Convert.ToBase64String(Encrypt($"{data}", key ?? bytes));

    public static string EncryptToBase64String(byte[] data, string key) =>
        Convert.ToBase64String(Encrypt(data, key));

    public static string EncryptToBase64String(object data) =>
        Convert.ToBase64String(Encrypt($"{data}", ""));

    public static string EncryptToBase64String(object data, string key) =>
        Convert.ToBase64String(Encrypt($"{data}", key));

    public static byte[] Decrypt(byte[] data, byte[] key = null)
    {
        key ??= bytes;
        if(data.Length == 0) return data;
        return ToByteArray(Decrypt(ToUInt32Array(data, false), ToUInt32Array(FixKey(key), false)),
            true);
    }

    public static byte[] Decrypt(byte[] data, string key = null) => Decrypt(data,
        !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes);

    public static byte[] DecryptBase64String(object data, byte[] key = null) => Decrypt(
        $"{data}".IsBase64() ? Convert.FromBase64String($"{data}") : utf8.GetBytes($"{data}"),
        key ?? bytes);

    public static byte[] DecryptBase64String(object data, string key = null) => Decrypt(
        $"{data}".IsBase64() ? Convert.FromBase64String($"{data}") : utf8.GetBytes($"{data}"),
        !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes);

    public static string DecryptToString(byte[] data, byte[] key = null) =>
        utf8.GetString(Decrypt(data, key ?? bytes));

    public static string DecryptToString(byte[] data, string key = null) =>
        utf8.GetString(Decrypt(data, !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes));

    public static string DecryptBase64StringToString(object data, byte[] key = null) =>
        utf8.GetString(DecryptBase64String(data, key ?? bytes));

    public static string DecryptBase64StringToString(object data, string key = null) =>
        utf8.GetString(DecryptBase64String(data,
            !string.IsNullOrEmpty(key) ? utf8.GetBytes(key) : bytes));

    private static uint[] Encrypt(uint[] v, uint[] k)
    {
        var n = v.Length - 1;
        if(n < 1) return v;
        uint z = v[n], y, sum = 0, e;
        int p, q = 6 + 52 / (n + 1);

        unchecked {
            while(0 < q--) {
                sum += delta;
                e = (sum >> 2) & 3;

                for(p = 0; p < n; p++) {
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
        if(n < 1) return v;
        uint z, y = v[0], sum, e;
        int p, q = 6 + 52 / (n + 1);

        unchecked {
            sum = (uint)(q * delta);

            while(sum != 0) {
                e = (sum >> 2) & 3;

                for(p = n; p > 0; p--) {
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
        if(key.Length == 16) return key;
        var fixedkey = new byte[16];
        if(key.Length < 16)
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

        if(includeLength) {
            result = new uint[n + 1];
            result[n] = (uint)length;
        }
        else {
            result = new uint[n];
        }
        for(var i = 0; i < length; i++) result[i >> 2] |= (uint)data[i] << ((i & 3) << 3);
        return result;
    }

    private static byte[] ToByteArray(uint[] data, bool includeLength)
    {
        var n = data.Length << 2;

        if(includeLength) {
            var m = (int)data[data.Length - 1];
            n -= 4;
            if(m < n - 3 || m > n) return null;
            n = m;
        }
        var result = new byte[n];
        for(var i = 0; i < n; i++) result[i] = (byte)(data[i >> 2] >> ((i & 3) << 3));
        return result;
    }
}
