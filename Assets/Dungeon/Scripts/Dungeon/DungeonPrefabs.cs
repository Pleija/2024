using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    /**
 * A collection of all the Objects the DungeonGenerator can use.
 */
    [System.Serializable]
    public class DungeonPrefabs {

        //Starting Cells for the dungeon. This will be the cells the hero will spawn
        public List<CellManager> FirstCells;
        //Ending Cells for the dungeon. Where will be the stair to the next stage
        public List<CellManager> EndingCells;
        //All the cells prefabs that will be used on the dungeon
        public List<CellManager> CellPrefabs;
        //All the walls prefabs
        public List<GameObject> WallPrefabs;
        //All the doors prefabs.
        public List<GameObject> DoorPrefabs;

        //All the decorations that go in the walls
        public List<GameObject> WallDecorationsPrefab;

        //All the weapons that you can find in the ground
        public List<GameObject> weaponItems;

        //Clean all the collections
        public void Reset()
        {
            FirstCells = new List<CellManager>();
            EndingCells = new List<CellManager>();
            CellPrefabs = new List<CellManager>();
            WallPrefabs = new List<GameObject>();
            DoorPrefabs = new List<GameObject>();
            WallDecorationsPrefab = new List<GameObject>();
            weaponItems = new List<GameObject>();
        }

        //Merge a collection to this collections
        //Used to create the collection of the current level for the dungeon
        public void Add(DungeonPrefabs toAdd)
        {
            CellPrefabs.AddRange(toAdd.CellPrefabs);
            DoorPrefabs.AddRange(toAdd.DoorPrefabs);
            EndingCells.AddRange(toAdd.EndingCells);
            FirstCells.AddRange(toAdd.FirstCells);
            WallPrefabs.AddRange(toAdd.WallPrefabs);
            WallDecorationsPrefab.AddRange(toAdd.WallDecorationsPrefab);
            weaponItems.AddRange(toAdd.weaponItems);
        }

        //Get a random CellManager for the first cell
        public CellManager GetRandomFirstCellPrefab()
        {
            return FirstCells[Random.Range(0, FirstCells.Count)];
        }

        //Get a random CellManager for the last cell
        public CellManager GetRandomEndCellPrefab()
        {
            return EndingCells[Random.Range(0, EndingCells.Count)];
        }

        //Get a random CellManager
        public CellManager GetRandomCellPrefab()
        {
            return CellPrefabs[Random.Range(0, CellPrefabs.Count)];
        }

        //Get a random Wall
        public GameObject GetRandomWallPrefab()
        {
            return WallPrefabs[Random.Range(0, WallPrefabs.Count)];
        }
        //Get a random wall decoration
        public GameObject GetRandomWallDecorationPrefab()
        {
            return WallDecorationsPrefab[Random.Range(0, WallDecorationsPrefab.Count)];
        }
        //Get a random Door
        public GameObject GetRandomDoorPrefab()
        {
            return DoorPrefabs[Random.Range(0, DoorPrefabs.Count)];
        }

        //Get a random weapon Item
        public GameObject GetRandomWeaponItem()
        {
            return weaponItems[Random.Range(0, weaponItems.Count)];
        }

    }
}
