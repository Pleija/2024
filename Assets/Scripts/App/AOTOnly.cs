using System.Collections.Generic;
using NodeCanvas.Framework;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace App
{
    public class AOTOnly : MonoBehaviour
    {
        void Hook()
        {
            var test = new object[] {
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
                new Variable<int>()
            };
        }
    }
}
