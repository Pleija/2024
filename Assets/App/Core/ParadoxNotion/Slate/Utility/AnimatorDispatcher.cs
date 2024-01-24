#region
using System;
using UnityEngine;
#endregion

namespace Slate
{
    [ExecuteInEditMode]
    ///<summary>Forwards Animator based calls</summary>
    public class AnimatorDispatcher : MonoBehaviour
    {
        private Animator _animator;

        private Animator animator =>
                _animator != null ? _animator : _animator = GetComponent<Animator>();

        private void OnAnimatorIK(int index)
        {
            if (onAnimatorIK != null) onAnimatorIK(index);
        }

        public event Action<int> onAnimatorIK;
    }
}
