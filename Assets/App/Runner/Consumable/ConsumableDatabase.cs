﻿#region
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace Runner.Consumable
{
    /// <summary>
    ///     The consumable database is an asset in the project where designers can drag'n'drop the prefab
    ///     for the Consumable. This allows explicit
    ///     definition (you can leave one out of the database to not appear in game) contrary to automatic
    ///     population of the database like the Character one does.
    /// </summary>
    [CreateAssetMenu(fileName = "Consumables", menuName = "Trash Dash/Consumables Database")]
    public class ConsumableDatabase : ScriptableObject
    {
        public static Dictionary<Consumable.ConsumableType, Consumable> _consumablesDict;
        public Consumable[] consumbales;

        public void Load()
        {
            if (_consumablesDict == null) {
                _consumablesDict = new Dictionary<Consumable.ConsumableType, Consumable>();
                for (var i = 0; i < consumbales.Length; ++i)
                    _consumablesDict.Add(consumbales[i].GetConsumableType(), consumbales[i]);
            }
        }

        public static Consumable GetConsumbale(Consumable.ConsumableType type)
        {
            Consumable c;
            return _consumablesDict.TryGetValue(type, out c) ? c : null;
        }
    }
}
