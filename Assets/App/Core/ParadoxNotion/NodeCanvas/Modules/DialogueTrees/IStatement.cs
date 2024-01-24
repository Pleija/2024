#region
using System;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Serialization;
using UnityEngine;
#endregion

namespace NodeCanvas.DialogueTrees
{
    ///<summary>An interface to use for whats being said by a dialogue actor</summary>
    public interface IStatement
    {
        string text { get; }
        AudioClip audio { get; }
        string meta { get; }
    }

    ///<summary>Holds data of what's being said usualy by an actor</summary>
    [Serializable]
    public class Statement : IStatement
    {
        [SerializeField]
        private string _text = string.Empty;

        [SerializeField]
        private AudioClip _audio;

        [SerializeField]
        private string _meta = string.Empty;

        //required
        public Statement() { }
        public Statement(string text) => this.text = text;

        public Statement(string text, AudioClip audio)
        {
            this.text = text;
            this.audio = audio;
        }

        public Statement(string text, AudioClip audio, string meta)
        {
            this.text = text;
            this.audio = audio;
            this.meta = meta;
        }

        public string text {
            get => _text;
            set => _text = value;
        }

        public AudioClip audio {
            get => _audio;
            set => _audio = value;
        }

        public string meta {
            get => _meta;
            set => _meta = value;
        }

        /// <summary>
        ///     Replace the text of the statement found in brackets, with blackboard variables ToString and
        ///     returns a
        ///     Statement copy
        /// </summary>
        public IStatement BlackboardReplace(IBlackboard bb)
        {
            var copy = JSONSerializer.Clone(this);
            copy.text = copy.text.ReplaceWithin('[', ']', input => {
                object o = null;

                if (bb != null) {
                    //referenced blackboard replace
                    var v = bb.GetVariable(input, typeof(object));
                    if (v != null) o = v.value;
                }

                if (input.Contains("/")) {
                    //global blackboard replace
                    var globalBB = GlobalBlackboard.Find(input.Split('/').First());

                    if (globalBB != null) {
                        var v = globalBB.GetVariable(input.Split('/').Last(), typeof(object));
                        if (v != null) o = v.value;
                    }
                }
                return o != null ? o.ToString() : input;
            });
            return copy;
        }

        public override string ToString() => text;
    }
}
