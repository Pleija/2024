#region
using System;
using UnityEngine;
#endregion

namespace NodeCanvas.DialogueTrees
{
    ///<summary> An interface to use for DialogueActors within a DialogueTree.</summary>
    public interface IDialogueActor
    {
        string name { get; }
        Texture2D portrait { get; }
        Sprite portraitSprite { get; }
        Color dialogueColor { get; }
        Vector3 dialoguePosition { get; }
        Transform transform { get; }
    }

    ///<summary>A basic rather limited implementation of IDialogueActor</summary>
    [Serializable]
    public class ProxyDialogueActor : IDialogueActor
    {
        public ProxyDialogueActor(string name, Transform transform)
        {
            this.name = name;
            this.transform = transform;
        }

        public string name { get; }
        public Texture2D portrait => null;
        public Sprite portraitSprite => null;
        public Color dialogueColor => Color.white;
        public Vector3 dialoguePosition => Vector3.zero;
        public Transform transform { get; }
    }
}
