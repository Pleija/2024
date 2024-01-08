using UnityEngine;

namespace Royale
{
    [CreateAssetMenu(fileName = "NewCard", menuName = "Unity Royale/Card Data")]
    public class CardData : ScriptableObject
    {
        [Header("Card graphics")]
        public Sprite cardImage;

        [Header("List of Placeables")]
        public PlaceableData[] placeablesData; //link to all the Placeables that this card spawns

        public Vector3[] relativeOffsets; //the relative offsets (from cursor) where the placeables will be dropped
    }
}