using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
//using SystemTools;

//using UnityEngine.AddressableAssets;
//using UnityEngine.AddressableAssets.ResourceLocators;
using Object = UnityEngine.Object;

namespace Extensions
{
//    public enum SizeUnits
//    {
//        Byte,
//        KB,
//        MB,
//        GB,
//        TB,
//        PB,
//        EB,
//        ZB,
//        YB
//    }

    public static partial class Strings
    {
        public enum SizeUnits
        {
            Byte,
            KB,
            MB,
            GB,
            TB,
            PB,
            EB,
            ZB,
            YB
        }

        public class StringColor
        {
            public object result;
            public Func<object, object> func;

            public StringColor Callback(Func<object, object> call)
            {
                func = call;
                return this;
            }

            public StringColor(params string[] aValue)
            {
                result = aValue.JoinStr();
            }

            public static StringColor operator +(object value, StringColor target)
            {
                target.result = (value + " " + target.result).Trim();
                return target;
            }

//            public static DebugString operator +(DebugString target, object value)
//            {
//                target.result = (target.result + " " + value).Trim();
//                return target;
//            }

//            public static DebugString operator +(DebugString target,object value)
//            {
//                target.result = (value + " " + target.result).Trim();
//                return target;
//            }

            public static implicit operator StringColor(string value)
            {
                return new StringColor(value);
            }

            public static implicit operator string(StringColor aStringColor)
            {
                return aStringColor.ToString();
            }

            public override string ToString()
            {
                return (func != null ? func.Invoke(result) : result).ToString();
            }
        }

        public static string Shuffle(this string str, int seed = -1)
        {
            var array = str.ToCharArray();
            var rng = new System.Random(
                seed == -1 ? DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().GetHashCode() : seed);

            var n = array.Length;
            while (n > 1) {
                n--;
                var k = rng.Next(n + 1);
                (array[k], array[n]) = (array[n], array[k]);
            }

            return new string(array);
        }

        public static string Shuffle(this string str, long seed = -1)
        {
            return Shuffle(str, seed == -1 ? -1 : seed.GetHashCode());
        }

        public static string ChangeExtension(this string path, string ext)
        {
            return Path.ChangeExtension(path, ext).Trim('.');
        }

        public static string GetFileExt(this string path)
        {
            return Path.GetExtension(path);
        }

        public static string GetDirectoryName(this string path)
        {
            return Path.GetDirectoryName(path) + "";
        }

        public static string CreateDirectoryByDirname(this string path)
        {
            Directory.CreateDirectory(path);
            return path;
        }

        public static string CreateDirectoryByFilename(this string path)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path) + "");
            return path;
        }

        public static string ToScriptName(this string path)
        {
            return path.Replace(" ", "_").Replace("__", "_").Replace(".", "").Replace("(Clone)", "");
        }

        public static string SubStringPHP(this string origin, int start, int? length = null)
        {
            if (start < 0) start = Mathf.Clamp(0, origin.Length + start, origin.Length - 1);

            if (length >= 0) return origin.Substring(start, (int)length);

            if (length < 0) return origin.Substring(start, origin.Length + (int)length - start);

            return origin.Substring(start);
        }

        public static string ToSize(this long value, SizeUnits unit = SizeUnits.MB, string fmt = "0.00")
        {
            return (value / (double)Math.Pow(1024, (long)unit)).ToString(fmt);
        }

        public static string ToSize(this int value, SizeUnits unit = SizeUnits.MB, string fmt = "0.00")
        {
            return (value / (double)Math.Pow(1024, (long)unit)).ToString(fmt);
        }

        // public static string ToSizeMB(this long value, string fmt = "0.00") {
        //     return (value / (double) Math.Pow(1024, (long) SizeUnits.MB)).ToString(fmt);
        // }
        //
        // public static string ToSizeMB(this int value,string fmt = "0.00") {
        //     return (value / (double) Math.Pow(1024, (long) SizeUnits.MB)).ToString(fmt);
        // }

        public static string ToSize(this float value, SizeUnits unit = SizeUnits.MB, string fmt = "0.00")
        {
            return (value / (double)Math.Pow(1024, (long)unit)).ToString(fmt);
        }

        public static string ToSize(this double value, SizeUnits unit = SizeUnits.MB, string fmt = "0.00")
        {
            return (value / (double)Math.Pow(1024, (long)unit)).ToString(fmt);
        }

        /// <summary>
        /// Check if string is Base64
        /// </summary>
        /// <param name="base64"></param>
        /// <returns></returns>
        public static bool IsBase64String(this string base64)
        {
            try {
                if (string.IsNullOrEmpty(base64.Trim())) return false;

                Convert.FromBase64String(base64.Trim());
                return true;
            }
            catch (Exception exception) {
                // Handle the exception
            }

            return false;

//            //https://stackoverflow.com/questions/6309379/how-to-check-for-a-valid-base64-encoded-string
//            //Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
//            return !string.IsNullOrEmpty(base64) && Convert.TryFromBase64String(base64, new byte[base64.Length], out int _);
        }

        public static bool EventOnList(this List<string> tags)
        {
            return EventOn(tags);
        }

        public static bool EventOnArray(this string[] tags)
        {
            return EventOn(tags);
        }

        public static bool EventOn(this IEnumerable<string> tags)
        {
            return false;
        }

//        public static bool IsBase64String( this string base64 )
//        {
//            try {
//                if (!base64.IsNullOrEmpty() &&
//                    Convert.FromBase64String(Regex.Replace(base64, @"\s+", "", RegexOptions.Multiline)).Any())
//                    return true;
//            } catch (Exception exception) {
//                // Handle the exception
//            }
//
//            return false;
//        }

        public static string JoinStr<T>(this IEnumerable<T> list, string str = ", ")
        {
            return string.Join(str, list.Select(t => $"{t}"));
        }

        public static bool IsNotNullOrEmpty(this string value)
        {
            return !(value == null || value.Length == 0);
        }

        //public static bool IsNullOrEmpty(this string value) => value == null || value.Length == 0;

        public static bool IsNullOrEmpty(this string input)
        {
            return string.IsNullOrEmpty(input);
        }

        public static bool IsNullOrWhiteSpace(this string input)
        {
            return string.IsNullOrWhiteSpace(input);
        }

        public static string _TagKey(this string str)
        {
            var opt = RegexOptions.Singleline | RegexOptions.IgnorePatternWhitespace;
            str = Regex.Replace($"{str.Trim()}", @"\s+", "_", opt);
            return str.Replace("__", "_").ToCapitalStr();
        }

        //public static string ToString(this byte[] bytes) => System.Text.Encoding.Default.GetString(bytes);

        public static string ToPadSides(this string str, int totalWidth = -1, char paddingChar = '-')
        {
            totalWidth = totalWidth > 0 ? totalWidth : PadLength;
            var padding = totalWidth - str.Length;
            var padLeft = padding / 2 + str.Length;
            return $" {str} ".PadLeft(padLeft, paddingChar).PadRight(totalWidth, paddingChar).ToBold();
        }

        public static string ToCapitalStr(this string str)
        {
            return Regex.Replace(str, @"\b[a-z]", m => m.Value.ToUpper());
        }

        static int PadLength = 40;

        public static string GetPath(Component gameObject)
        {
            return gameObject == null
                ? ""
                : string.Join("/",
                    gameObject.GetComponentsInParent<Transform>().Select(t => t.name).Reverse().ToArray());
        }

        //
        static StringColor DebugStr(Func<object, object> str, IEnumerable<object> extra)
        {
//            var ret = extra.Select(t => t is Type type ? type.GetNiceFullName() :
//                t is string s ? s :
//                t is Component component ? GetPath(component) + " -> " + component.GetType().GetNiceFullName() :
//                t/*JsonConvert.SerializeObject(t)*/);
            return new StringColor(string.Join(", ", extra)).Callback(str);
        }

        public static StringColor ToGreen(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=#21B351>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToYellow(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=yellow>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToWhite(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=white>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToBlue(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=#19A8F3>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToRed(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=red>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToPink(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<color=magenta>{$"{obj}".ToPadSides()}</color>", extra.Prepend(str));
        }

        public static StringColor ToBold(this object str, params object[] extra)
        {
            return DebugStr(obj => $"<b>{obj}</b>", extra.Prepend(str));
        }

        public static byte[] GetBytes(this string str)
        {
            return Encoding.UTF8.GetBytes(str);
        }

        public static string GetString(this byte[] bytes)
        {
            return Encoding.UTF8.GetString(bytes);
        }

        public static string GetBase64String(this byte[] bytes)
        {
            return Convert.ToBase64String(bytes);
        }

        public static byte[] GetFromBase64(this string str)
        {
            return Convert.FromBase64String(str);
        }

        public static string Md5(this string str)
        {
            using (var hash = MD5.Create()) {
                return string.Concat(hash.ComputeHash(Encoding.UTF8.GetBytes(str)).Select(x => x.ToString("x2")));
            }
        }

        public static string PadBoth(this string str, int length, string chars = "=")
        {
            var spaces = length - str.Length - 2;
            var padLeft = spaces / 2 + str.Length;
            return $" {str} ".PadLeft(padLeft, chars[0]).PadRight(length, chars[0]);
        }

        public static string Color(this string str, Color color)
        {
            return "<color=#" + ColorUtility.ToHtmlStringRGB(color) + $">{str}</color>";
        }

        // [Kernel.Handle]
        public static string Md5Salt(this string observedText)
        {
//            var bytes = new byte[] {
//                0x54, 0x86, 0x5B, 0x40, 0xF2, 0x0B, 0x62, 0x44, 0x93, 0xE6, 0xF7, 0x7B, 0x29, 0x0F, 0x24, 0x9D
//            };
            return string.Concat(MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(
                observedText + "405B8654-0BF2-4462-93E6-F77B290F249D"

                //"405B8654-0BF2-4462-93E6-F77B290F249D"
                /*new Guid(bytes).ToString("D").ToUpper()*/)).Select(x => x.ToString("x2")));
        }

        /// <summary>
        ///     Give data and an encryption key, apply RC4 cryptography.  RC4 is symmetric,
        ///     which means this single method will work for encrypting and decrypting.
        /// </summary>
        /// <remarks>
        ///     https://en.wikipedia.org/wiki/RC4
        /// </remarks>
        /// <param name="data">
        ///     Byte array representing the data to be encrypted/decrypted
        /// </param>
        /// <param name="key">
        ///     Byte array representing the key to use
        /// </param>
        /// <returns>
        ///     Byte array representing the encrypted/decrypted data.
        /// </returns>

        //[Kernel.Handle]
        public static string ToCode(this string source)
        {
            byte[] rc4(byte[] input, byte[] key)
            {
                var encrypted = new byte[input.Length];
                int x, y, j = 0;
                var box = new int[256];
                for (var i = 0; i < 256; i++) box[i] = i;
                for (var i = 0; i < 256; i++) {
                    j = (key[i % key.Length] + box[i] + j) % 256;
                    x = box[i];
                    box[i] = box[j];
                    box[j] = x;
                }

                for (var i = 0; i < input.Length; i++) {
                    y = (i + 1) % 256;
                    j = (box[y] + j) % 256;
                    x = box[y];
                    box[y] = box[j];
                    box[j] = x;
                    encrypted[i] = (byte)(input[i] ^ box[(box[y] + box[j]) % 256]);
                }

                return encrypted;
            }

            byte[] Apply(byte[] data, byte[] key)
            {
                //  Key Scheduling Algorithm Phase:
                //  KSA Phase Step 1: First, the entries of S are set equal to the values of 0 to 255
                //                    in ascending order.
                var S = new int[256];
                for (var _ = 0; _ < 256; _++) S[_] = _;

                //  KSA Phase Step 2a: Next, a temporary vector T is created.
                var T = new int[256];

                //  KSA Phase Step 2b: If the length of the key k is 256 bytes, then k is assigned to T.
                if (key.Length == 256)
                    Buffer.BlockCopy(key, 0, T, 0, key.Length);
                else

                    //  Otherwise, for a key with a given length, copy the elements of
                    //  the key into vector T, repeating for as many times as neccessary to
                    //  fill T
                    for (var _ = 0; _ < 256; _++)
                        T[_] = key[_ % key.Length];

                //  KSA Phase Step 3: We use T to produce the initial permutation of S ...
                var i = 0;
                var j = 0;
                for (i = 0; i < 256; i++) {
                    //  increment j by the sum of S[i] and T[i], however keeping it within the
                    //  range of 0 to 255 using mod (%) division.
                    j = (j + S[i] + T[i]) % 256;

                    //  Swap the values of S[i] and S[j]
                    var temp = S[i];
                    S[i] = S[j];
                    S[j] = temp;
                }

                //  Pseudo random generation algorithm (Stream Generation):
                //  Once the vector S is initialized from above in the Key Scheduling Algorithm Phase,
                //  the input key is no longer used.  In this phase, for the length of the data, we ...
                i = j = 0;
                var result = new byte[data.Length];
                for (var iteration = 0; iteration < data.Length; iteration++) {
                    //  PRGA Phase Step 1. Continously increment i from 0 to 255, starting it back
                    //                     at 0 once we go beyond 255 (this is done with mod (%) division
                    i = (i + 1) % 256;

                    //  PRGA Phase Step 2. Lookup the i'th element of S and add it to j, keeping the
                    //                     result within the range of 0 to 255 using mod (%) division
                    j = (j + S[i]) % 256;

                    //  PRGA Phase Step 3. Swap the values of S[i] and S[j]
                    var temp = S[i];
                    S[i] = S[j];
                    S[j] = temp;

                    //  PRGA Phase Step 4. Use the result of the sum of S[i] and S[j], mod (%) by 256,
                    //                     to get the index of S that handls the value of the stream value K.
                    var K = S[(S[i] + S[j]) % 256];

                    //  PRGA Phase Step 5. Use bitwise exclusive OR (^) with the next byte in the data to
                    //                     produce  the next byte of the resulting ciphertext (when
                    //                     encrypting) or plaintext (when decrypting)
                    result[iteration] = Convert.ToByte(data[iteration] ^ K);
                }

                //  return the result
                return result;
            }

            //  First, let's get the byte data of the phrase
            var data = Encoding.UTF8.GetBytes("//" + source.Md5Salt() + "\n" + source);

            //  Next, let's get the byte data of the key phrase
            var key = Encoding.UTF8.GetBytes("fb0ff85a-1116-4b15-9333-77b53e80acf9");

            //  We can encrypt it like so
            var encrypted_data = rc4(data, key); //data;

            //data;
            //

            string ByteArrayToHexStringViaStringJoinArrayConvertAll(byte[] bytes, string sp = "")
            {
                return string.Join(sp, Array.ConvertAll(bytes, b => b.ToString("X2")));
            }

            //  Decode the decrypted data
            var decrypted_phrase = /*SystemTools.xxtea.Encrypt*/
                XXTEA.EncryptToBase64String("//" + source.Md5Salt() + "\n" + source,
                    "fb0ff85a-1116-4b15-9333-77b53e80acf9");

            //  Convert.ToBase64String(data);
            //ByteArrayToHexStringViaStringJoinArrayConvertAll(encrypted_data);

            //Encoding.Default.GetString(encrypted_data);
            return decrypted_phrase;
        }

//    #if UNITY_EDITOR
//        [MenuItem("Tests/Md5 Key")]
//        static void TestMd5Key()
//        {
//            // https://stackoverflow.com/questions/311165/how-do-you-convert-a-byte-array-to-a-hexadecimal-string-and-vice-versa
//            string ByteArrayToHexStringViaStringJoinArrayConvertAll(byte[] bytes, string sp = ",")
//            {
//                return string.Join(sp, Array.ConvertAll(bytes, b => "0x" + b.ToString("X2")));
//            }
//
//            var guid = Guid.Parse("405B8654-0BF2-4462-93E6-F77B290F249D").ToByteArray();
//            var hex = ByteArrayToHexStringViaStringJoinArrayConvertAll(guid);
//            Debug.Log($"var bytes = new byte[] {{ {hex} }};");
//            var bytes = new byte[] {
//                0x54, 0x86, 0x5B, 0x40, 0xF2, 0x0B, 0x62, 0x44, 0x93, 0xE6, 0xF7, 0x7B, 0x29, 0x0F, 0x24, 0x9D
//            };
//
//            Debug.Log(new Guid(bytes).ToString("D").ToUpper());
//        }
//    #endif

        public static string JsPath(this string path, string ext = default, bool fullpath = false)
        {
            path = path.Replace("\\", "/");
            path = Regex.Replace(path, "^[./]+", "");
            if (!ext.IsNullOrWhitespace()) {
                ext = $"{ext}".Contains(".") ? ext : $".{ext}";
                if (!path.Contains(ext)) path += ext;
            }

            return path;
        }

        public static string JsFullPath(this string path)
        {
            if (!path.StartsWith("Assets") && !path.StartsWith("Packages")) path = $"Assets/{path}";

            return Path.GetFullPath(Path.Combine(Path.GetDirectoryName(Application.dataPath) + "", path))
                .Replace("\\", "/");
        }

        public static T HasAsset<T>(this string path) where T : Object
        {
            path = path.JsPath();
            var resPath = path.Split(new[] {
                "Resources/"
            }, StringSplitOptions.None).Last();

            var res = Resources.Load<T>(resPath);
#if UNITY_EDITOR
            if (res == null)
                res = AssetDatabase.LoadAssetAtPath<T>(!path.Contains("Assets/") && !path.Contains("Packages/")
                    ? $"Assets/{path}"
                    : path);
#endif
            if (res == null) {
                var allAssets = Addressables.ResourceLocators.OfType<ResourceLocationMap>().SelectMany(locationMap =>
                    locationMap.Locations.Keys.Select(key => key.ToString()));

                if (allAssets.Any(s => s == path)) { }
            }

            return res;
        }

        public static string RemoveAssets(this string path)
        {
            path = path.Replace(Application.dataPath, "Assets");
            return Regex.Replace($"{path}", @"^Assets", "").TrimStart('\\', '/');
        }

        public static string GetObjectPath(this Object obj)
        {
#if UNITY_EDITOR
            return AssetDatabase.GetAssetPath(obj) ?? string.Empty;
#endif
            return string.Empty;
        }

        public static string GetGUID(this string path)
        {
#if UNITY_EDITOR
            return AssetDatabase.AssetPathToGUID(path) ?? string.Empty;
#endif
            return string.Empty;
        }

        public static string FullPath(this string path)
        {
#if UNITY_EDITOR
            var root = Path.GetDirectoryName(Application.dataPath);
            if (!File.Exists(path)) {
                if (File.Exists(Path.Combine(root, path)))
                    path = Path.Combine(root, path);
                else if (File.Exists(Path.Combine(root, "Assets", path))) path = Path.Combine(root, "Assets", path);
            }
#endif
            return path.Replace('\\', '/');
        }
    }
}