#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard/Dictionaries")]
    public class TryGetValue<T> : ConditionTask
    {
        [RequiredField]
        public BBParameter<string> key;

        [BlackboardOnly]
        public BBParameter<T> saveValueAs;

        [RequiredField, BlackboardOnly]
        public BBParameter<Dictionary<string, T>> targetDictionary;

        protected override string info => string.Format("{0}.TryGetValue({1} as {2})",
            targetDictionary, key, saveValueAs);

        protected override bool OnCheck()
        {
            if (targetDictionary.value == null) return false;
            T result;

            if (targetDictionary.value.TryGetValue(key.value, out result)) {
                saveValueAs.value = result;
                return true;
            }
            return false;
        }
    }
}
