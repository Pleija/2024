using System;
using System.IO;
using System.Linq;
using System.Text;
using Extensions;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;
using UnityEditor;
using UnityEngine;

namespace Helpers.Encryption
{
    public partial class RSATool
    {
        static RSATool m_instance;

        public static RSATool instance {
            get {
                if (m_instance == null) m_instance = new RSATool();

                return m_instance;
            }
        }

        public RSATool() { }

        /// <summary>
        /// KEY 结构体
        /// </summary>
        public struct RSAKEY
        {
            /// <summary>
            /// 公钥
            /// </summary>
            public string PublicKey { get; set; }

            /// <summary>
            /// 私钥
            /// </summary>
            public string PrivateKey { get; set; }
        }

        #if UNITY_EDITOR
        [MenuItem("Tests/Sandbox/RSA Test")]
        static void TestRSA() {
            var t = instance.GetKey();
            Debug.Log(t.PrivateKey);
            Debug.Log(t.PublicKey);
        }
        #endif

        public RSAKEY GetKey() {
            //RSA密钥对的构造器
            var keyGenerator = new RsaKeyPairGenerator();

            //RSA密钥构造器的参数
            var param = new RsaKeyGenerationParameters(BigInteger.ValueOf(3), new SecureRandom(), 1024, //密钥长度
                25);

            //用参数初始化密钥构造器
            keyGenerator.Init(param);

            //产生密钥对
            var keyPair = keyGenerator.GenerateKeyPair();

            //获取公钥和密钥
            var publicKey = keyPair.Public;
            var privateKey = keyPair.Private;
            var subjectPublicKeyInfo = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(publicKey);
            var privateKeyInfo = PrivateKeyInfoFactory.CreatePrivateKeyInfo(privateKey);
            var asn1ObjectPublic = subjectPublicKeyInfo.ToAsn1Object();
            var publicInfoByte = asn1ObjectPublic.GetEncoded("UTF-8");
            var asn1ObjectPrivate = privateKeyInfo.ToAsn1Object();
            var privateInfoByte = asn1ObjectPrivate.GetEncoded("UTF-8");
            Debug.Log(ByteToString(publicInfoByte));
            Debug.Log(ByteToString(privateInfoByte));
            var item = new RSAKEY() {
                PublicKey = Convert.ToBase64String(publicInfoByte),
                PrivateKey = Convert.ToBase64String(privateInfoByte)
            };

            return item;
        }

        public static string ByteToString(byte[] bytes) {
            return "{ 0x" + string.Join(", 0x", bytes.Select(b => $"{b:X2}")) + " }";
        }

        //        public static string ByteArrayToHexString( byte[] Bytes )
//        {
//            StringBuilder Result = new StringBuilder(Bytes.Length * 2);
//            string HexAlphabet = "0123456789ABCDEF";
//
//            foreach (byte B in Bytes) {
//                Result.Append(HexAlphabet[ (int)( B >> 4 ) ]);
//                Result.Append(HexAlphabet[ (int)( B & 0xF ) ]);
//            }
//
//            return Result.ToString();
//        }

        AsymmetricKeyParameter GetPublicKeyParameter(string s = null) {
            //s = s.Replace("\r", "").Replace("\n", "").Replace(" ", "");
            var publicInfoByte = Strings.IsNullOrEmpty(s) ? publicKey : Convert.FromBase64String(s);
            var pubKeyObj = Asn1Object.FromByteArray(publicInfoByte); //这里也可以从流中读取，从本地导入
            var pubKey = PublicKeyFactory.CreateKey(publicInfoByte);
            return pubKey;
        }

        AsymmetricKeyParameter GetPrivateKeyParameter(string s = null) {
            #if UNITY_EDITOR

            //s = s.Replace("\r", "").Replace("\n", "").Replace(" ", "");
            var privateInfoByte = Strings.IsNullOrEmpty(s) ? privateKey : Convert.FromBase64String(s);

            // Asn1Object priKeyObj = Asn1Object.FromByteArray(privateInfoByte);//这里也可以从流中读取，从本地导入
            // PrivateKeyInfo privateKeyInfo = PrivateKeyInfoFactory.CreatePrivateKeyInfo(privateKey);
            var priKey = PrivateKeyFactory.CreateKey(privateInfoByte);
            return priKey;
            #endif
            return null;
        }

        public bool EncryptByKey(ref byte[] byteData, bool isPublic = false) {
            //非对称加密算法，加解密用
            IAsymmetricBlockCipher engine = new Pkcs1Encoding(new RsaEngine());

            //加密
            //try {
            engine.Init(true, isPublic ? GetPublicKeyParameter() : GetPrivateKeyParameter());

            //  byte[] byteData = System.Text.Encoding.UTF8.GetBytes(s);
            var inputLen = byteData.Length;
            var ms = new MemoryStream();
            var offSet = 0;
            byte[] cache;
            var i = 0;

            // 对数据分段加密
            while (inputLen - offSet > 0) {
                if (inputLen - offSet > 117)
                    cache = engine.ProcessBlock(byteData, offSet, 117);
                else
                    cache = engine.ProcessBlock(byteData, offSet, inputLen - offSet);

                ms.Write(cache, 0, cache.Length);
                i++;
                offSet = i * 117;
            }

            byteData = ms.ToArray();
            return true;

            //var ResultData = engine.ProcessBlock(byteData, 0, byteData.Length);
            // return Convert.ToBase64String(encryptedData);

            //Console.WriteLine("密文（base64编码）:" + Convert.ToBase64String(testData) + Environment.NewLine);
//            } catch (Exception ex) {
//                throw ex;
//
//                return false;
//            }
        }

        public string EncryptByKey(string s, string key = null, bool isPublic = false) {
            //非对称加密算法，加解密用
            IAsymmetricBlockCipher engine = new Pkcs1Encoding(new RsaEngine());

            //加密
            //try {
            engine.Init(true, isPublic ? GetPublicKeyParameter(key) : GetPrivateKeyParameter(key));
            var byteData = Encoding.UTF8.GetBytes($"{s}");
            var inputLen = byteData.Length;
            var ms = new MemoryStream();
            var offSet = 0;
            byte[] cache;
            var i = 0;

            // 对数据分段加密
            while (inputLen - offSet > 0) {
                if (inputLen - offSet > 117)
                    cache = engine.ProcessBlock(byteData, offSet, 117);
                else
                    cache = engine.ProcessBlock(byteData, offSet, inputLen - offSet);

                ms.Write(cache, 0, cache.Length);
                i++;
                offSet = i * 117;
            }

            var encryptedData = ms.ToArray();

            //var ResultData = engine.ProcessBlock(byteData, 0, byteData.Length);
            return Convert.ToBase64String(encryptedData);

            //Console.WriteLine("密文（base64编码）:" + Convert.ToBase64String(testData) + Environment.NewLine);
//            } catch (Exception ex) {
//                throw ex;
//
//                return ex.Message;
//            }
        }

        /// <summary>
        /// 解密
        /// </summary>
        /// <param name="s"></param>
        /// <param name="key"></param>
        /// <param name="isPublic"></param>
        /// <returns></returns>
        public bool DecryptByPublicKey(ref byte[] byteData, bool isPublic = true) {
            //   s = s.Replace("\r", "").Replace("\n", "").Replace(" ", "");

            //非对称加密算法，加解密用
            IAsymmetricBlockCipher engine = new Pkcs1Encoding(new RsaEngine());

            //加密

            //try {
            engine.Init(false, isPublic ? GetPublicKeyParameter() : GetPrivateKeyParameter());

            //byte[] byteData = Convert.FromBase64String(s);
            var inputLen = byteData.Length;
            var ms = new MemoryStream();
            var offSet = 0;
            byte[] cache;
            var i = 0;

            // 对数据分段加密
            while (inputLen - offSet > 0) {
                if (inputLen - offSet > 128)
                    cache = engine.ProcessBlock(byteData, offSet, 128);
                else
                    cache = engine.ProcessBlock(byteData, offSet, inputLen - offSet);

                ms.Write(cache, 0, cache.Length);
                i++;
                offSet = i * 128;
            }

            byteData = ms.ToArray();
            return true;

            //var ResultData = engine.ProcessBlock(byteData, 0, byteData.Length);
            //  return Encoding.UTF8.GetString(ms.ToArray());

            //Console.WriteLine("密文（base64编码）:" + Convert.ToBase64String(testData) + Environment.NewLine);
//            } catch (Exception ex) {
//                throw ex;
//
//                //Debug.LogError(ex.Message);
//
//                return false;
//            }
        }

        /// <summary>
        /// 解密
        /// </summary>
        /// <param name="s"></param>
        /// <param name="key"></param>
        /// <param name="isPublic"></param>
        /// <returns></returns>
        public string DecryptByPublicKey(string s, string key = null, bool isPublic = true) {
            //s = s.Replace("\r", "").Replace("\n", "").Replace(" ", "");

            //非对称加密算法，加解密用
            IAsymmetricBlockCipher engine = new Pkcs1Encoding(new RsaEngine());

            //加密
            try {
                engine.Init(false, isPublic ? GetPublicKeyParameter(key) : GetPrivateKeyParameter(key));
                var byteData = Convert.FromBase64String($"{s}");
                var inputLen = byteData.Length;
                var ms = new MemoryStream();
                var offSet = 0;
                byte[] cache;
                var i = 0;

                // 对数据分段加密
                while (inputLen - offSet > 0) {
                    if (inputLen - offSet > 128)
                        cache = engine.ProcessBlock(byteData, offSet, 128);
                    else
                        cache = engine.ProcessBlock(byteData, offSet, inputLen - offSet);

                    ms.Write(cache, 0, cache.Length);
                    i++;
                    offSet = i * 128;
                }

                var encryptedData = ms.ToArray();

                //var ResultData = engine.ProcessBlock(byteData, 0, byteData.Length);
                return Encoding.UTF8.GetString(ms.ToArray());

                //Console.WriteLine("密文（base64编码）:" + Convert.ToBase64String(testData) + Environment.NewLine);
            }
            catch (Exception ex) {
                return ex.Message;
            }
        }

        /// <summary>
        /// 签名
        /// </summary>
        /// <param name="data">数据</param>
        /// <param name="key">密匙</param>
        /// <returns></returns>
        public string SignByPrivateKey(string data, string key = null) {
            var priKey = GetPrivateKeyParameter(key);
            var byteData = Encoding.UTF8.GetBytes(data);
            var normalSig = SignerUtilities.GetSigner("SHA1WithRSA");
            normalSig.Init(true, priKey);
            normalSig.BlockUpdate(byteData, 0, data.Length);
            var normalResult = normalSig.GenerateSignature(); //签名结果
            return Convert.ToBase64String(normalResult);

            //return System.Text.Encoding.UTF8.GetString(normalResult);
        }

        /// <summary>
        /// 验签
        /// </summary>
        /// <param name="plainData">验证数据</param>
        /// <param name="sign">签名</param>
        /// <param name="key">公匙</param>
        /// <returns></returns>
        public bool ValidationPublicKey(string plainData, string sign, string key = null) {
            var priKey = GetPublicKeyParameter(key);
            var signBytes = Convert.FromBase64String(sign);
            var plainBytes = Encoding.UTF8.GetBytes(plainData);
            var verifier = SignerUtilities.GetSigner("SHA1WithRSA");
            verifier.Init(false, priKey);
            verifier.BlockUpdate(plainBytes, 0, plainBytes.Length);
            return verifier.VerifySignature(signBytes); //验签结果
        }
    }
}
