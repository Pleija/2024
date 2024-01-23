﻿using UnityEngine;

namespace NodeCanvas.DialogueTrees
{
    ///<summary> A DialogueActor Component.</summary>
    [AddComponentMenu("NodeCanvas/Dialogue Actor")]
    public class DialogueActor : MonoBehaviour, IDialogueActor
    {
        [SerializeField]
        protected string _name;

        [SerializeField]
        protected Texture2D _portrait;

        [SerializeField]
        protected Color _dialogueColor = Color.white;

        [SerializeField]
        protected Vector3 _dialogueOffset;

        private Sprite _portraitSprite;
        public new string name => _name;
        public Texture2D portrait => _portrait;

        public Sprite portraitSprite {
            get {
                if (_portraitSprite == null && portrait != null)
                    _portraitSprite = Sprite.Create(portrait, new Rect(0, 0, portrait.width, portrait.height)
                        , new Vector2(0.5f, 0.5f));
                return _portraitSprite;
            }
        }

        public Color dialogueColor => _dialogueColor;
        public Vector3 dialoguePosition => transform.TransformPoint(_dialogueOffset);

        //IDialogueActor.transform is implemented by inherited MonoBehaviour.transform

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        private void Reset()
        {
            _name = gameObject.name;
        }

        private void OnDrawGizmos()
        {
            Gizmos.DrawLine(transform.position, dialoguePosition);
        }

#endif
    }
}
