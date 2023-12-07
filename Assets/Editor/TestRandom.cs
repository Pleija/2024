using System;
using System.Linq;
using System.Reflection;
using System.Text;
using Api;
using App.Models;
using HashidsNet;
using MessagePack;
using Network;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;

[TestFixture]
public class TestRandom
{
    private static long seed;

    [MenuItem("Debug/Test Random"), Test]
    public static void Test()
    {
        if(seed == 0) {
            seed = ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeSeconds();
        }
        var pcg = new PcgRandom(0, seed);
        Debug.Log($"seed: {seed} result: {pcg.Shuffle(NetConfig.Base64)}");
            // @formatter:off
            Debug.Log(/* "KCBVY4m8LaPh3nzu2tUs7JDFlk5Wfyb0N6Ope9MHw/QxjIXrEcRoSi+AvTGZ1qgd" */ Encoding.UTF8.GetString(new byte[] {
                0x4B, 0x43, 0x42, 0x56, 0x59, 0x34, 0x6D, 0x38, 0x4C, 0x61, 0x50, 0x68, 0x33, 
                0x6E, 0x7A, 0x75, 0x32, 0x74, 0x55, 0x73, 0x37, 0x4A, 0x44, 0x46, 0x6C, 0x6B, 
                0x35, 0x57, 0x66, 0x79, 0x62, 0x30, 0x4E, 0x36, 0x4F, 0x70, 0x65, 0x39, 0x4D,
                0x48, 0x77, 0x2F, 0x51, 0x78, 0x6A, 0x49, 0x58, 0x72, 0x45, 0x63, 0x52, 0x6F,
                0x53, 0x69, 0x2B, 0x41, 0x76, 0x54, 0x47, 0x5A, 0x31, 0x71, 0x67, 0x64
            }));
        // @formatter:on
    }

    [Test]
    public static void TestHashId()
    {
        Debug.Log(Session.self.DefaultSeed);
        Debug.Log(Session.self.DefaultKey);
        var hashid = new Hashids(Session.self.DefaultKey, 0,
            new PcgRandom(0, Session.self.DefaultSeed).Shuffle(Session.self.DefaultKey));
        var t = hashid.EncodeLong(DateTimeOffset.UtcNow.ToUnixTimeSeconds(), 100);
        Debug.Log(t);
        var r = hashid.DecodeLong(t);
        Debug.Log(string.Join(", ", r));
    }

    [Test]
    public static void TestNet()
    {
        Client.Call<long, long>(ApiFunc.Reg, r => DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            (r, t) => { });
    }

    [Test]
    public static void TestEncrypt()
    {
        Debug.Log(XJson.EncryptToBase64String("test"));
    }

    [Test]
    public static void TestMsgPack()
    {
        Debug.Log(MessagePackSerializer.Serialize((1, 1)).Length);
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        Debug.Log(MessagePackSerializer.Serialize(timestamp).Length);
        Debug.Log(XJson.Encrypt(MessagePackSerializer.Serialize(1)).Length);
        Debug.Log(XJson.Encrypt(BitConverter.GetBytes(timestamp)).Length);
        Debug.Log(MessagePackSerializer.Serialize(HashId.self.EncodeLong(timestamp)).Length);
    }

    

    [Test]
    public static void TestTuple()
    {
        Debug.Log((1, "test"));
        var data = MessagePackSerializer.Serialize((1, "test"));
        var type = typeof(Tuple<,>).MakeGenericType(typeof(int), typeof(string));
        Debug.Log(type.FullName);
        Debug.Log((1, "test").GetType().FullName);
        Debug.Log(data.Length);
        var method =
            typeof(NetConfig).GetMethod("Deserialize", BindingFlags.Public | BindingFlags.Static)!
                .MakeGenericMethod(type);
        var ret = method.Invoke(null, new object[] { data });
        // var ret = MessagePackSerializer.Deserialize<Tuple<int,string>>(data);
        Debug.Log(ret);
    }
}
