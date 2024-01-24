#region
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace ParadoxNotion
{
    public static class LayerUtils
    {
        ///<summary>Create LayerMask from layer names</summary>
        public static LayerMask CreateFromNames(params string[] layerNames) =>
                LayerNamesToMask(layerNames);

        ///<summary>Create LayerMask from layer numbers</summary>
        public static LayerMask CreateFromNumbers(params int[] layerNumbers) =>
                LayerNumbersToMask(layerNumbers);

        ///<summary>Layer names to LayerMask</summary>
        public static LayerMask LayerNamesToMask(params string[] layerNames)
        {
            var ret = (LayerMask)0;
            foreach (var name in layerNames) ret |= 1 << LayerMask.NameToLayer(name);
            return ret;
        }

        ///<summary>Layer numbers to LayerMask</summary>
        public static LayerMask LayerNumbersToMask(params int[] layerNumbers)
        {
            var ret = (LayerMask)0;
            foreach (var layer in layerNumbers) ret |= 1 << layer;
            return ret;
        }

        ///<summary>Inverse LayerMask</summary>
        public static LayerMask Inverse(this LayerMask mask) => ~mask;

        ///<summary>Adds layer names to LayerMask</summary>
        public static LayerMask AddToMask(this LayerMask mask, params string[] layerNames) =>
                mask | LayerNamesToMask(layerNames);

        ///<summary>Remove layer names from LayerMask</summary>
        public static LayerMask RemoveFromMask(this LayerMask mask, params string[] layerNames)
        {
            LayerMask invertedOriginal = ~mask;
            return ~(invertedOriginal | LayerNamesToMask(layerNames));
        }

        ///<summary>Does LayerMask contain any target layers (by name)</summary>
        public static bool ContainsAnyLayer(this LayerMask mask, params string[] layerNames)
        {
            if (layerNames == null) return false;
            for (var i = 0; i < layerNames.Length; i++)
                if (mask == (mask | (1 << LayerMask.NameToLayer(layerNames[i]))))
                    return true;
            return false;
        }

        ///<summary>Does LayerMask contain all target layers (by name)</summary>
        public static bool ContainsAllLayers(this LayerMask mask, params string[] layerNames)
        {
            if (layerNames == null) return false;
            for (var i = 0; i < layerNames.Length; i++)
                if (!(mask == (mask | (1 << LayerMask.NameToLayer(layerNames[i])))))
                    return false;
            return true;
        }

        ///<summary>Return layer names in/from LayerMask</summary>
        public static string[] MaskToNames(this LayerMask mask)
        {
            var output = new List<string>();

            for (var i = 0; i < 32; ++i) {
                var shifted = 1 << i;

                if ((mask & shifted) == shifted) {
                    var layerName = LayerMask.LayerToName(i);
                    if (!string.IsNullOrEmpty(layerName)) output.Add(layerName);
                }
            }
            return output.ToArray();
        }

        ///<summary>Redable LayerMask names</summary>
        public static string MaskToString(this LayerMask mask) => MaskToString(mask, ", ");

        ///<summary>Redable LayerMask names by delimiter</summary>
        public static string MaskToString(this LayerMask mask, string delimiter) =>
                string.Join(delimiter, MaskToNames(mask));
    }
}
