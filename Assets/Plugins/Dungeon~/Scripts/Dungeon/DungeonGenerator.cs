using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    public class DungeonGenerator : MonoBehaviour {

        //Size of the cell prefabs. Cells need to be a square in size
        public static int CellSize = 10;
        //Half of the size of the cell prefabs.
        public static int HalfCellSize = 5;

        //Generate a dungeon once the script is loaded?
        public bool generateOnStart = true;
        //Generate a hero once the dungeon is loaded?
        public bool generateHero = true;

        //Current level of the dungeon
        public int level = 1;

        //Size of the dungeon in the X axis, this represent the number of cells in the X axis
        public int xSize = 3;
        //Size of the dungeon in the Y axis, this represent the number of cells in the Y axis
        public int zSize = 3;

        //The main path for the dungeon can use this number of cells before making the stair for the next level.
        //If the path get to a dead end, it will create the stair as well, so this number can be infinite you want.
        public int MainPathMaxLen = 100;
        //Current size of the main path.
        [HideInInspector]
        public int MainPathCurrLen = 0;

        //Prefab of the player object
        public GameObject PlayerPrefab;


        //Store all the cells created in its X and Z axis
        private CellManager[,] Cells;

        //This is all the prefabs the Manager will use to create the dungeons.
        //For more info, read the LevelPrefabs script.
        public LevelPrefabs[] prefabs;

        //Collection of all the prefabs the manager can use in the current level.
        protected DungeonPrefabs currentStagePrefabs;

        //Instance for this generator
        public static DungeonGenerator instance {
            get
            {
                if (_instance == null)
                    _instance = FindObjectOfType<DungeonGenerator>();
                return _instance;
            }
        }
        private static DungeonGenerator _instance;

        void Awake()
        {
            //Set this as instance.
            _instance = this;
        }

        void Start() {
            //Generate the dungeon if is allowed to create on Start.
            if(generateOnStart)
                GenerateDungeon();
        }

        //Get all the prefabs the manager can use in the current level.
        void GeneratePrefabs()
        {
            //Create a empty collection for this stage
            currentStagePrefabs = new DungeonPrefabs();
            currentStagePrefabs.Reset();

            //Go thro all the configurated prefabs for this game.
            foreach (LevelPrefabs pref in prefabs)
            {
                //If the prefab collection can appear on this level, add all the prefabs to current stage collection.
                if(pref.AppearInAllLevels || (level >= pref.AppearFromLevel && level <= pref.ApperToLevel))
                {
                    currentStagePrefabs.Add(pref.prefabs);
                }
            }
        }

        //Destroy all the dungeon
        public void DestroyDungeon()
        {
       

            //Destroy all the children, that will be dungeon elements.
            int childs = transform.childCount;
            for (int i = childs - 1; i >= 0; i--)
            {
                GameObject.Destroy(transform.GetChild(i).gameObject);
            }

            //Set the size of the main path to zero
            MainPathCurrLen = 0;
        }


        //Generate a new dungeon and destroy the old one
        public void GenerateDungeon()
        {
            //Destroy the old dungeon first.
            DestroyDungeon();
            //Generate a new prefab collection for the current stage (Making the old one be destroyed)
            GeneratePrefabs();

            //Create a new dungeon On a coorotine, since can be a heavy process.)
            StartCoroutine(CreateDungeon());
        }

        //Create a new Dungeon
        public IEnumerator CreateDungeon()
        {
            //Wait a frame to clean anything from the last dungeon (OnDestroy mostly)
            yield return null;

            //Set the Objectmanager to have the same size of the dungeon. (Ex: If a cell hold 10 itens in X axis, it will be XSize * 10 plus one more item for the border in the last cell)
            ObjectManager.Start((xSize  * CellSize) + 1, (zSize  * CellSize) + 1);
            Cells = new CellManager[xSize, zSize];


            //Create the main path, from the Hero start location until the stair to the next level
            MakePath(new IntVector2());

            //Once the path is complete, fill the rest of the grid with random cells.
            FillGrid();
        
            //Wait a frame so each object on the grid can be configurated corretly
            yield return null;

            //Add decorations for the dungeon
            AddDecorations();
            //Add weapons on the ground for the dungeon
            AddItemWeapons();

            //Generate the hero
            if(generateHero)
                CreatePlayer();
        }

        //Add decorations for the dungeon
        public void AddDecorations()
        {
            //Loop all the spots in the dungeon
            for (int x = 0; x < ObjectManager.sizeX; x++)
            {
                for (int z = 0; z < ObjectManager.sizeZ; z++)
                {
                    //If there is a wall in the spot
                    BaseObj wall = ObjectManager.GetObjectOfTypeAt(x, z, BaseObj.Type.wall);
                    if(wall != null)
                    {
                        //There is a .025 chance to add a decoration for the all
                        if(Random.Range(0, 1f) < 0.075)
                            Instantiate(currentStagePrefabs.GetRandomWallDecorationPrefab(), wall.transform.position, Quaternion.identity, wall.gameObject.transform);
                    }

                    /**
                 * Others decorations can be added here, if the place is empty it may add decoration for the ground
                 */
                }
            }
        }

        //Add weapon itens on the ground
        //To create other types of items, this function can be cloned, of updated to receibe a collection of prefabs to create at random.
        public void AddItemWeapons()
        {
            //Used so there is no possiblity of an infinite loop, is the max numbers of tries before give up to add the weapon
            int giveupAfterTries = 50;

            //Qtd of weapons that will appear on the ground for this level.
            int qtdWeaponsInStage = Random.Range(0, 3);

            //Loop the QTD of weapons to appear on the level
            for (int qtd = 0; qtd < qtdWeaponsInStage; qtd++)
            {
                //Qtd of objects in the current position
                List<BaseObj> objs;

                //Qtd of tries to create this weapon
                int currTry = 0;
                do
                {
                    //Choose a random X and Z position to create the weapon
                    int RandomX = Random.Range(0, ObjectManager.sizeX);
                    int RandomZ = Random.Range(0, ObjectManager.sizeZ);

                    //Get objects in this position
                    objs = ObjectManager.GetObjectsAt(new IntVector2(RandomX, RandomZ));

                    //Only create the weapon if there is no objects on this spot.
                    if(objs.Count == 0)
                    {
                        Instantiate(currentStagePrefabs.GetRandomWeaponItem(), new Vector3(RandomX, 0, RandomZ), Quaternion.identity, transform);
                        //Debug.Log("Weapont at: " + RandomX + " " + RandomZ);
                    
                    }

                    //Add one more try to create this weapon
                    currTry++;

                    //Do this while the weapon was not created of it got to the limit of tries to create it.
                } while (objs.Count != 0 && currTry < giveupAfterTries);
          
            }

        }


        //Create a player on the dungeon start.
        public void CreatePlayer()
        {
            //The dungeon start will always be on point 0,0
            Instantiate<GameObject>(PlayerPrefab, new Vector3(HalfCellSize, 0.5f, HalfCellSize), Quaternion.identity, this.transform);
        }


        //Create the main path in the dungeon.
        public void MakePath(IntVector2 pos, Sides.sideChoices lastChoice = Sides.sideChoices.none)
        {


            //The chosen cell for this place in the grid
            CellManager cell = null;
            //What will be the next side that the main path will go for the next cell
            Sides.sideChoices nextMove = NextStep(pos.x, pos.z);

            //The position of the current cell
            Vector3 cellPos = new Vector3((pos.x * CellSize) + HalfCellSize, 0, (pos.z * CellSize) + HalfCellSize);

            //Increase the size of the main path
            MainPathCurrLen++;

            //If the last choice is none, this is the first cell
            if (lastChoice == Sides.sideChoices.none)
            {
                //Create the first cell for the Dungeon, where the player will spawn
                cell = GameObject.Instantiate<CellManager>(currentStagePrefabs.GetRandomFirstCellPrefab(), cellPos, Quaternion.identity, this.transform);
            }
            //If the nextMove is None (DeadEnd) or the mainPath is at the limit length, create the last cell
            else if (nextMove == Sides.sideChoices.none || MainPathCurrLen >= MainPathMaxLen)
            {
                //The cell that the ladder to the next level will appear.
                cell = GameObject.Instantiate<CellManager>(currentStagePrefabs.GetRandomEndCellPrefab(), cellPos, Quaternion.identity, this.transform);
            }
            else
            {
                //Create a random cell.
                cell = GameObject.Instantiate<CellManager>(currentStagePrefabs.GetRandomCellPrefab(), cellPos, Quaternion.identity, this.transform);
            }
            Cells[pos.x, pos.z] = cell;


        

            //Create all the walls for this cell, but only if the neighbour cell is not created (to prevent two walls on top of another).
            if (!CellIsCreated(pos + Sides.SideToVector(Sides.sideChoices.right)))
                cell.AddWall(Sides.sideChoices.right, currentStagePrefabs.GetRandomWallPrefab());
            if (!CellIsCreated(pos + Sides.SideToVector(Sides.sideChoices.left)))
                cell.AddWall(Sides.sideChoices.left, currentStagePrefabs.GetRandomWallPrefab());
            if (!CellIsCreated(pos + Sides.SideToVector(Sides.sideChoices.up)))
                cell.AddWall(Sides.sideChoices.up, currentStagePrefabs.GetRandomWallPrefab());
            if (!CellIsCreated(pos + Sides.SideToVector(Sides.sideChoices.down)))
                cell.AddWall(Sides.sideChoices.down, currentStagePrefabs.GetRandomWallPrefab());



            //Check if there is no more space for the next cell or the limit for the main path is set
            if (MainPathCurrLen < MainPathMaxLen && nextMove != Sides.sideChoices.none)
            {
                //Create a door for the next room
                cell.AddWall(nextMove, currentStagePrefabs.GetRandomDoorPrefab());
                //Create the next cell following the path side choice
                MakePath(pos + Sides.SideToVector(nextMove), nextMove);
            }

        }

        //Fill all the grid of the Dungeon that still don't have a cell.
        //Usually it will be called after the main path is created.
        public void FillGrid(){
            for(int x = 0; x < xSize; x++)
            {
                for(int z = 0; z < zSize; z++)
                {
                    IntVector2 pos = new IntVector2(x, z);
                    //If there is no cell in this position, create one
                    if (ExistCell(pos) && GetCell(pos) == null)
                    {
                        //Get a random cell to create on this position
                        CellManager cell = GameObject.Instantiate<CellManager>(currentStagePrefabs.GetRandomCellPrefab(), new Vector3((pos.x * CellSize) + HalfCellSize, 0, (pos.z * CellSize) + HalfCellSize), Quaternion.identity, this.transform);
                        Cells[pos.x, pos.z] = cell;

                        //There is a door to this cell?
                        bool gotDoor = false; 

                        //One loop for each direction
                        for (int s = 0; s < 4; s++)
                        {
                            //Position for the neightboor cell
                            IntVector2 neighbour = pos + Sides.SideToVector((Sides.sideChoices)s);
                            //If got a door, it has a 0.7 chance to create a wall, or if there don't exist the neightboor, create a wall 
                            if ((gotDoor && Random.Range(0,1f) > 0.3f) || !ExistCell(neighbour))
                            {
                                //If there is no cell there (If there is, it will already have a wall in here)
                                if(!CellIsCreated(neighbour))
                                    cell.AddWall((Sides.sideChoices)s, currentStagePrefabs.GetRandomWallPrefab());
                            }
                            //If there is a cell in the neightbour position, create a door
                            else if (GetCell(neighbour) != null)
                            {
                                //Now there is at least on door to this cell
                                gotDoor = true;
                                //Create and add the door to this cell.
                                GameObject doorPrefab = currentStagePrefabs.GetRandomDoorPrefab();
                                cell.AddWall((Sides.sideChoices)s, doorPrefab);
                                GetCell(neighbour).RemoveWall(Sides.invert((Sides.sideChoices)s));
                            }


                        }

                    }
                }
            }
        }

        //What will be the next side that the main path will go
        public Sides.sideChoices NextStep(int currX, int currZ)
        {
            //Possible choices for the next step
            List<Sides.sideChoices> choices = new List<Sides.sideChoices>();

            //If the currX is 0, it can't go negative (-1), so it can only go right
            if (currX == 0)
            {
                choices.Add(Sides.sideChoices.right);
            }
            //Of the currX is at the max border, it can go only left.
            else if (currX == xSize)
            {
                choices.Add(Sides.sideChoices.left);
            }
            //Else it can go right or left
            else
            {
                choices.Add(Sides.sideChoices.right);
                choices.Add(Sides.sideChoices.left);
            }

            //If Z is 0, it can only go up (not -1)
            if (currZ == 0)
            {
                choices.Add(Sides.sideChoices.up);
            }
            //If is at edge, can only go down
            else if (currX == xSize)
            {
                choices.Add(Sides.sideChoices.down);
            }
            //Anything in between, can go down or up
            else
            {
                choices.Add(Sides.sideChoices.up);
                choices.Add(Sides.sideChoices.down);
            }

            //Sort the order to a random order. It will be the order that will try to go for the next cell.
            choices.Sort((x, y) => Random.value < 0.5f ? -1 : 1);
        
            //Get the current position
            IntVector2 currPos = new IntVector2(currX, currZ);

            //Go thro all choices
            for (int i = 0; i < choices.Count ; i++)
            {
                //Get the next cell position
                IntVector2 nextPos = currPos + Sides.SideToVector(choices[i]);

                //If there is not a created cell in this position and is a valid position, go to this side next.
                if (ExistCell(nextPos) && GetCell(nextPos) == null)
                {
                    return choices[i];
                }
            }
            //If there is no sides to choose from, return none.
            return Sides.sideChoices.none;

        }

    
        //Check if a cell position is valid
        public bool ExistCell(IntVector2 pos)
        {
            if (pos.x >= xSize) return false;
            if (pos.z >= zSize) return false;
            if (pos.x < 0) return false;
            if (pos.z < 0) return false;
            return true;
        }
        //Get the cell for a position
        public CellManager GetCell(IntVector2 pos)
        {
        
            return Cells[pos.x, pos.z];
        }
        //Check if there is a cell created in this position.
        public bool CellIsCreated(IntVector2 pos)
        {
            if (pos.x >= xSize) return false;
            if (pos.z >= zSize) return false;
            if (pos.x < 0) return false;
            if (pos.z < 0) return false;

            return Cells[pos.x, pos.z] != null;
        }


    }
}
