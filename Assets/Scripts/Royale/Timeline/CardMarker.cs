using System;
using System.ComponentModel;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;

namespace Royale
{
    [Serializable, DisplayName("Card Marker")]
    public class CardMarker : Marker, INotification
    {
        public CardData card;
        public Vector3 position;
        public Placeable.Faction faction;

        //required by INotification but we're not actually using it
        public PropertyName id => new PropertyName();
    }
}