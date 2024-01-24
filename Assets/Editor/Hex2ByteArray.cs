#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sirenix.OdinInspector;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
#endregion

public class Hex2ByteArray : OdinEditorWindow
{
    [SerializeField, HideInInspector]
    private string m_origin;

    [TextArea(5, 10)]
    public string output;

    [TextArea(5, 10)]
    public string code;

    private byte[] bytes => Enumerable.Range(0, origin.Length / 2)
            .Select(x => Convert.ToByte(origin.Substring(x * 2, 2), 16))
            .ToArray();

    [ShowInInspector]
    public string origin {
        get => m_origin;
        set => m_origin = value;
    }

    public static string ToHex(byte[] bytes) => BitConverter.ToString(bytes).Replace("-", "");

    public static string JoinStr<T>(IEnumerable<T> list, string str = ", ")
    {
        return string.Join(str, list.Select(t => $"{t}"));
    }

    [MenuItem("Tools/" + nameof(Hex2ByteArray), priority = -1000)]
    private static void ShowDialog()
    {
        var window = CreateInstance<Hex2ByteArray>();
        window.titleContent = new GUIContent(nameof(Hex2ByteArray).ToTitleCase());
        window.Show();
    }

    [Button]
    private void SetNormal()
    {
        // m_origin = value.Replace("-", "");
        output = "{0x"
                + JoinStr(Encoding.UTF8.GetBytes(origin).Select(x => $"{x:X2}"), ", 0x")
                + "}";
        code = $@"/* ""{origin}"" */ Encoding.UTF8.GetString(new byte[] {output})";
        Debug.Log( /* "test" */ Encoding.UTF8.GetString(new byte[] { 0x74, 0x65, 0x73, 0x74 }));
    }

    [ButtonGroup("guid")]
    private void NewGuid() => origin = Guid.NewGuid().ToString("N").ToUpper();

    [ButtonGroup("guid")]
    private void SetGuid()
    {
        origin = origin.Replace("-", "");
        output = "{0x" + JoinStr(bytes.Select(x => $"{x:X2}"), ", 0x") + "}";
        code = $@"
byte[] bytes = {output};
var guid = Guid.Parse(bytes.ToHex()).ToString(""N"");
";
    }

    public static string ByteArrayToString(byte[] bytes) =>
            BitConverter.ToString(bytes).Replace("-", "");

    //return string.Concat(Array.ConvertAll(bytes, b => b.ToString("X2")));
    [ButtonGroup("copy")]
    private void CopyOutput()
    {
        // origin = origin;
        GUIUtility.systemCopyBuffer = output;
    }

    [ButtonGroup("copy")]
    private void CopyCode()
    {
        //  origin = origin;
        GUIUtility.systemCopyBuffer = code;
    }

    [ButtonGroup("guid")]
    private void TestGuidResult()
    {
        var guid = Guid.Parse(ToHex(bytes)).ToString("N").ToUpper();
        Debug.Log(guid);
        Debug.Log(ToHex(bytes));
    }
}
