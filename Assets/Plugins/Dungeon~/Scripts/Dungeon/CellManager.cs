using UnityEngine;

namespace Dungeon
{
    /**
 * A game object that is a cell (Square ground with items on top) will need this class.
 * It will create walls and doors around the cell so that the player can navigate between cells.
 * The dungeon is made of cells, a dungeon that have a size of X=3 Z=2 will have 3 cells on the X axis and 2 cells on the Z axis.
 */
    public class CellManager : MonoBehaviour {

        //Cells can have 4 walls, one in each side
        protected GameObject[] walls = new GameObject[4];

        //Add a wall in one of the sides of the cell
        public void AddWall(Sides.sideChoices side, GameObject prefab)
        {
            GameObject wall = walls[(int)side];

            //If there is already a wall, destroy it
            if (wall != null)
                Destroy(wall);

            //If the wall is one of the sides, turn it 90 deegres.
            Quaternion rotation = Quaternion.identity;
            if (side == Sides.sideChoices.left || side == Sides.sideChoices.right)
                rotation = Quaternion.Euler(0, 90, 0);

            //Create the wall
            wall = Instantiate(prefab, (int)(DungeonGenerator.CellSize * 0.5f) * Sides.SideToVector(side) + transform.position, rotation, transform);

            walls[(int)side] = wall;
        }

        //Remove a wall from one of the sides.
        //If the Dungeon manager want to remove a wall to add a door, it will call this function before making the door.
        public void RemoveWall(Sides.sideChoices side)
        {
            GameObject wall = walls[(int)side];

            if (wall != null)
                Destroy(wall);
        }
    }
}
