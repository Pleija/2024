#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class CheckVectorDistance : ConditionTask
    {
        public CompareMethod comparison = CompareMethod.EqualTo;
        public BBParameter<float> distance;

        [BlackboardOnly]
        public BBParameter<Vector3> vectorA;

        [BlackboardOnly]
        public BBParameter<Vector3> vectorB;

        protected override string info => string.Format("Distance ({0}, {1}) {2} {3}", vectorA,
            vectorB,
            OperationTools.GetCompareString(comparison), distance);

        protected override bool OnCheck()
        {
            var d = Vector3.Distance(vectorA.value, vectorB.value);
            return OperationTools.Compare(d, distance.value, comparison, 0f);
        }
    }
}
