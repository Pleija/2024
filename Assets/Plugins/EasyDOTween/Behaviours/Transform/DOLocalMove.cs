//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace EasyDOTween.Animation.Transform
{
    using DG.Tweening;
    
    
    [UnityEngine.AddComponentMenu("EasyDOTween/Transform/DOLocalMove")]
    public class DOLocalMove : EasyDOTween.Animation<UnityEngine.Transform>
    {
        
        [UnityEngine.SerializeField()]
        private UnityEngine.Vector3 endValue;
        
        [UnityEngine.SerializeField()]
        private bool snapping = false;
        
        protected override DG.Tweening.Tween CreateTween(UnityEngine.Transform target, float duration)
        {
            return target.DOLocalMove(endValue, duration, snapping);
        }
    }
}
