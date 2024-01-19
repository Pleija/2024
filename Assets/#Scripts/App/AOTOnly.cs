using System;
using System.Collections.Generic;
using NodeCanvas.Framework;
using Sirenix.Serialization;
using StackExchange.Redis;
using TMPro;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.UI;
using Object = UnityEngine.Object;

namespace App
{
    public class AOTOnly : MonoBehaviour
    {
        private void Hook()
        {
            var types = new Type[] {
                typeof(Variable<AssetReference>),
                typeof(Variable<bool>),
                typeof(Variable<GameObject>),
                typeof(Variable<Component>),
                typeof(Variable<Object>),
                typeof(Variable<string>),
                typeof(Variable<int>),
                typeof(Variable<float>),
                typeof(Variable<long>),
                typeof(Variable<Vector2>),
                typeof(Variable<Vector2Int>),
                typeof(Variable<Vector3>),
                typeof(Variable<Vector3Int>),
            };
            var test = new object[] {
                SerializationUtility.DeserializeValue<RedisKey>(null),
                new Variable<Color>(),
                new Variable<Component>(),
                new Variable<Text>(),
                new Variable<TMP_Text>(),
                new Variable<GameObject>(),
                new Variable<Transform>(),
                new Variable<Object>(),
                new Variable<Texture>(),
                new Variable<Texture2D>(),
                new Variable<float>(),
                new Variable<string>(),
                new Variable<Vector2>(),
                new Variable<Vector2Int>(),
                new Variable<Vector3Int>(),
                new Variable<Vector3>(),
                new Variable<int>(),
            };
        }
    }
}
