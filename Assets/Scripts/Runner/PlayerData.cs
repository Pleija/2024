﻿using System.Collections.Generic;
using System.IO;
using System.Linq;
using Runner.Characters;
using Runner.Consumable;
using Runner.Missions;
using Runner.Themes;
using Runner.Tracks;
using Runner.UI.Shop;
using SqlCipher4Unity3D;
using UniRx;
using UnityEditor;
using UnityEngine;

namespace Runner {

    public struct HighscoreEntry : System.IComparable<HighscoreEntry>
    {
        public string name;
        public int score;

        public int CompareTo(HighscoreEntry other) =>
            // We want to sort from highest to lowest, so inverse the comparison.
            other.score.CompareTo(score);
    }

    /// <summary>
    ///     Save data for the game. This is stored locally in this case, but a "better" way to do it would
    ///     be to store it on a server
    ///     somewhere to avoid player tampering with it. Here potentially a player could modify the binary
    ///     file to add premium currency.
    /// </summary>
    public class PlayerData: DataModel<PlayerData>
    {
        protected static PlayerData m_Instance;
        public static PlayerData instance => m_Instance;
        protected string saveFile = "";
        public IntReactiveProperty coins = 0;
        public IntReactiveProperty premium = 0;

        public Dictionary<Consumable.Consumable.ConsumableType, int> consumables =
            new Dictionary<Consumable.Consumable.ConsumableType, int>(); // Inventory of owned consumables and quantity.

        public List<string> characters = new List<string>(); // Inventory of characters owned.
        public int usedCharacter;                            // Currently equipped character.
        public int usedAccessory = -1;

        public List<string>
            characterAccessories =
                new List<string>(); // List of owned accessories, in the form "charName:accessoryName".

        public List<string> themes = new List<string>(); // Owned themes.
        public int usedTheme;                            // Currently used theme.
        public List<HighscoreEntry> highscores = new List<HighscoreEntry>();
        public List<MissionBase> missions = new List<MissionBase>();
        public string previousName = "Trash Cat";
        public bool licenceAccepted;
        public bool tutorialDone;

        public float masterVolume = float.MinValue,
            musicVolume = float.MinValue,
            masterSFXVolume = float.MinValue;

        //ftue = First Time User Expeerience. This var is used to track thing a player do for the first time. It increment everytime the user do one of the step
        //e.g. it will increment to 1 when they click Start, to 2 when doing the first run, 3 when running at least 300m etc.
        public int ftueLevel = 0;

        //Player win a rank ever 300m (e.g. a player having reached 1200m at least once will be rank 4)
        public int rank = 0;

        // This will allow us to add data even after production, and so keep all existing save STILL valid. See loading & saving for how it work.
        // Note in a real production it would probably reset that to 1 before release (as all dev save don't have to be compatible w/ final product)
        // Then would increment again with every subsequent patches. We kept it to its dev value here for teaching purpose. 
        private static int s_Version = 12;

        public void Consume(Consumable.Consumable.ConsumableType type)
        {
            if(!consumables.ContainsKey(type))
                return;
            consumables[type] -= 1;
            if(consumables[type] == 0) consumables.Remove(type);
            Save();
        }

        public void Add(Consumable.Consumable.ConsumableType type)
        {
            if(!consumables.ContainsKey(type)) consumables[type] = 0;
            consumables[type] += 1;
            Save();
        }

        public void AddCharacter(string name)
        {
            characters.Add(name);
        }

        public void AddTheme(string theme)
        {
            themes.Add(theme);
        }

        public void AddAccessory(string name)
        {
            characterAccessories.Add(name);
        }

        // Mission management

        // Will add missions until we reach 2 missions.
        public void CheckMissionsCount()
        {
            while(missions.Count < 2)
                AddMission();
        }

        public void AddMission()
        {
            var val = Random.Range(0, (int)MissionBase.MissionType.MAX);
            var newMission = MissionBase.GetNewMissionFromType((MissionBase.MissionType)val);
            newMission.Created();
            missions.Add(newMission);
        }

        public void StartRunMissions(TrackManager manager)
        {
            for(var i = 0; i < missions.Count; ++i) missions[i].RunStart(manager);
        }

        public void UpdateMissions(TrackManager manager)
        {
            for(var i = 0; i < missions.Count; ++i) missions[i].Update(manager);
        }

        public bool AnyMissionComplete()
        {
            for(var i = 0; i < missions.Count; ++i)
                if(missions[i].isComplete)
                    return true;
            return false;
        }

        public void ClaimMission(MissionBase mission)
        {
            premium.Value += mission.reward;
#if UNITY_ANALYTICS // Using Analytics Standard Events v0.3.0
        AnalyticsEvent.ItemAcquired(AcquisitionType.Premium, // Currency type
            "mission",                                       // Context
            mission.reward,                                  // Amount
            "anchovies",                                     // Item ID
            premium,                                         // Item balance
            "consumable",                                    // Item type
            rank.ToString()                                  // Level
        );
#endif
            missions.Remove(mission);
            CheckMissionsCount();
            Save();
        }

        // High Score management

        public int GetScorePlace(int score)
        {
            var entry = new HighscoreEntry();
            entry.score = score;
            entry.name = "";
            var index = highscores.BinarySearch(entry);
            return index < 0 ? ~index : index;
        }

        public void InsertScore(int score, string name)
        {
            var entry = new HighscoreEntry();
            entry.score = score;
            entry.name = name;
            highscores.Insert(GetScorePlace(score), entry);

            // Keep only the 10 best scores.
            while(highscores.Count > 10)
                highscores.RemoveAt(highscores.Count - 1);
        }

        // File management

        public static void Create()
        {
            if(m_Instance == null) {
                m_Instance = self;//new PlayerData();
                if(!m_Instance.themes.Any()) {
                    Debug.Log("New Save PlayData");
                    NewSave();
                    m_Instance.Save();
                }
                // self.coins.Subscribe(x => {
                //     Debug.Log($"add coins: {x}");
                //     self.Save();
                // });
                // self.premium.Subscribe(x => {
                //     Debug.Log($"add premium: {x}");
                //     self.Save();
                // });

                //if we create the PlayerData, mean it's the very first call, so we use that to init the database
                //this allow to always init the database at the earlier we can, i.e. the start screen if started normally on device
                //or the Loadout screen if testing in editor
                CoroutineHandler.StartStaticCoroutine(CharacterDatabase.LoadDatabase());
                CoroutineHandler.StartStaticCoroutine(ThemeDatabase.LoadDatabase());
            }

            
            // m_Instance.saveFile = Application.persistentDataPath + "/save.bin";
            // if(File.Exists(m_Instance.saveFile))
            //     // If we have a save, we read it.
            //     m_Instance.Read();
            // else
            //     // If not we create one with default data.
            //     NewSave();
            m_Instance.CheckMissionsCount();
        }

        public static void NewSave()
        {
            m_Instance.characters.Clear();
            m_Instance.themes.Clear();
            m_Instance.missions.Clear();
            m_Instance.characterAccessories.Clear();
            m_Instance.consumables.Clear();
            m_Instance.usedCharacter = 0;
            m_Instance.usedTheme = 0;
            m_Instance.usedAccessory = -1;
            m_Instance.coins = 0;
            m_Instance.premium = 0;
            m_Instance.characters.Add("Trash Cat");
            m_Instance.themes.Add("Day");
            m_Instance.ftueLevel = 0;
            m_Instance.rank = 0;
            m_Instance.CheckMissionsCount();
            m_Instance.Save();
        }

        // public void Read()
        // {
        //     var r = new BinaryReader(new FileStream(saveFile, FileMode.Open));
        //     var ver = r.ReadInt32();
        //
        //     if(ver < 6) {
        //         r.Close();
        //         NewSave();
        //         r = new BinaryReader(new FileStream(saveFile, FileMode.Open));
        //         ver = r.ReadInt32();
        //     }
        //     coins = r.ReadInt32();
        //     consumables.Clear();
        //     var consumableCount = r.ReadInt32();
        //     for(var i = 0; i < consumableCount; ++i)
        //         consumables.Add((Consumable.Consumable.ConsumableType)r.ReadInt32(), r.ReadInt32());
        //
        //     // Read character.
        //     characters.Clear();
        //     var charCount = r.ReadInt32();
        //
        //     for(var i = 0; i < charCount; ++i) {
        //         var charName = r.ReadString();
        //         if(charName.Contains("Raccoon") && ver < 11)
        //             //in 11 version, we renamed Raccoon (fixing spelling) so we need to patch the save to give the character if player had it already
        //             charName = charName.Replace("Racoon", "Raccoon");
        //         characters.Add(charName);
        //     }
        //     usedCharacter = r.ReadInt32();
        //
        //     // Read character accesories.
        //     characterAccessories.Clear();
        //     var accCount = r.ReadInt32();
        //     for(var i = 0; i < accCount; ++i) characterAccessories.Add(r.ReadString());
        //
        //     // Read Themes.
        //     themes.Clear();
        //     var themeCount = r.ReadInt32();
        //     for(var i = 0; i < themeCount; ++i) themes.Add(r.ReadString());
        //     usedTheme = r.ReadInt32();
        //
        //     // Save contains the version they were written with. If data are added bump the version & test for that version before loading that data.
        //     if(ver >= 2) premium = r.ReadInt32();
        //
        //     // Added highscores.
        //     if(ver >= 3) {
        //         highscores.Clear();
        //         var count = r.ReadInt32();
        //
        //         for(var i = 0; i < count; ++i) {
        //             var entry = new HighscoreEntry();
        //             entry.name = r.ReadString();
        //             entry.score = r.ReadInt32();
        //             highscores.Add(entry);
        //         }
        //     }
        //
        //     // Added missions.
        //     if(ver >= 4) {
        //         missions.Clear();
        //         var count = r.ReadInt32();
        //
        //         for(var i = 0; i < count; ++i) {
        //             var type = (MissionBase.MissionType)r.ReadInt32();
        //             var tempMission = MissionBase.GetNewMissionFromType(type);
        //             tempMission.Deserialize(r);
        //             if(tempMission != null) missions.Add(tempMission);
        //         }
        //     }
        //
        //     // Added highscore previous name used.
        //     if(ver >= 7) previousName = r.ReadString();
        //     if(ver >= 8) licenceAccepted = r.ReadBoolean();
        //
        //     if(ver >= 9) {
        //         masterVolume = r.ReadSingle();
        //         musicVolume = r.ReadSingle();
        //         masterSFXVolume = r.ReadSingle();
        //     }
        //
        //     if(ver >= 10) {
        //         ftueLevel = r.ReadInt32();
        //         rank = r.ReadInt32();
        //     }
        //     if(ver >= 12) tutorialDone = r.ReadBoolean();
        //     r.Close();
        // }
        //
        // public void Save()
        // {
        //     var w = new BinaryWriter(new FileStream(saveFile, FileMode.OpenOrCreate));
        //     w.Write(s_Version);
        //     w.Write(coins);
        //     w.Write(consumables.Count);
        //
        //     foreach(var p in consumables) {
        //         w.Write((int)p.Key);
        //         w.Write(p.Value);
        //     }
        //
        //     // Write characters.
        //     w.Write(characters.Count);
        //     foreach(var c in characters) w.Write(c);
        //     w.Write(usedCharacter);
        //     w.Write(characterAccessories.Count);
        //     foreach(var a in characterAccessories) w.Write(a);
        //
        //     // Write themes.
        //     w.Write(themes.Count);
        //     foreach(var t in themes) w.Write(t);
        //     w.Write(usedTheme);
        //     w.Write(premium);
        //
        //     // Write highscores.
        //     w.Write(highscores.Count);
        //
        //     for(var i = 0; i < highscores.Count; ++i) {
        //         w.Write(highscores[i].name);
        //         w.Write(highscores[i].score);
        //     }
        //
        //     // Write missions.
        //     w.Write(missions.Count);
        //
        //     for(var i = 0; i < missions.Count; ++i) {
        //         w.Write((int)missions[i].GetMissionType());
        //         missions[i].Serialize(w);
        //     }
        //
        //     // Write name.
        //     w.Write(previousName);
        //     w.Write(licenceAccepted);
        //     w.Write(masterVolume);
        //     w.Write(musicVolume);
        //     w.Write(masterSFXVolume);
        //     w.Write(ftueLevel);
        //     w.Write(rank);
        //     w.Write(tutorialDone);
        //     w.Close();
        // }
    }

    // Helper class to cheat in the editor for test purpose
#if UNITY_EDITOR
    public class PlayerDataEditor : Editor
    {
        [MenuItem("Debug/Clear Save")]
        public static void ClearSave()
        {
            File.Delete(Application.persistentDataPath + "/save.bin");
        }

        [MenuItem("Debug/Give 1000000 fishbones and 1000 premium")]
        public static void GiveCoins()
        {
            PlayerData.instance.coins.Value += 1000000;
            PlayerData.instance.premium.Value += 1000;
            PlayerData.instance.Save();
        }

        [MenuItem("Debug/Give 10 Consumables of each types")]
        public static void AddConsumables()
        {
            for(var i = 0; i < ShopItemList.s_ConsumablesTypes.Length; ++i) {
                var c = ConsumableDatabase.GetConsumbale(ShopItemList.s_ConsumablesTypes[i]);
                if(c != null) PlayerData.instance.consumables[c.GetConsumableType()] = 10;
            }
            PlayerData.instance.Save();
        }
    }
#endif
}