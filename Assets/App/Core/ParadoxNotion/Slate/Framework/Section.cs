#region
using System;
using UnityEngine;
#endregion

namespace Slate
{
    ///<summary>Defines a section...</summary>
    [Serializable]
    public class Section
    {
        public enum ExitMode { Continue, Loop }

        ///<summary>Default color of Sections</summary>
        public static readonly Color DEFAULT_COLOR = Color.black.WithAlpha(0.3f);

        [SerializeField]
        private string _UID;

        [SerializeField]
        private string _name;

        [SerializeField]
        private float _time;

        [SerializeField]
        private ExitMode _exitMode;

        [SerializeField]
        private int _loopCount;

        [SerializeField]
        private Color _color = DEFAULT_COLOR;

        [SerializeField]
        private bool _colorizeBackground;

        ///<summary>A new section of name at time</summary>
        public Section(string name, float time)
        {
            this.name = name;
            this.time = time;
            UID = Guid.NewGuid().ToString();
        }

        ///<summary>The current loop iteration if section is looping</summary>
        public int currentLoopIteration { get; private set; }

        ///<summary>Unique ID.</summary>
        public string UID {
            get => _UID;
            private set => _UID = value;
        }

        ///<summary>The name of the section.</summary>
        public string name {
            get => _name;
            set => _name = value;
        }

        ///<summary>It's time.</summary>
        public float time {
            get => _time;
            set => _time = value;
        }

        ///<summary>What will happen when the section has reached it's end?</summary>
        public ExitMode exitMode {
            get => _exitMode;
            set => _exitMode = value;
        }

        public int loopCount {
            get => _loopCount;
            set => _loopCount = value;
        }

        ///<summary>Preferrence color.</summary>
        public Color color {
            get => _color.a > 0.1f ? _color : DEFAULT_COLOR;
            set => _color = value;
        }

        ///<summary>Will the timlines bg be colorized as well?</summary>
        public bool colorizeBackground {
            get => _colorizeBackground;
            set => _colorizeBackground = value;
        }

        ///<summary>Rest the looping state</summary>
        public void ResetLoops()
        {
            currentLoopIteration = 0;
        }

        ///<summary>Breaks out of the loop</summary>
        public void BreakLoop()
        {
            currentLoopIteration = int.MaxValue;
        }

        ///<summary>Updates looping state and returns if looped</summary>
        public bool TryUpdateLoop()
        {
            if (loopCount <= 0 && currentLoopIteration != int.MaxValue) return true;

            if (currentLoopIteration < loopCount) {
                currentLoopIteration++;
                return true;
            }
            return false;
        }

        public override string ToString() => string.Format("'{0}' Section Time: {1}", name, time);
    }
}
