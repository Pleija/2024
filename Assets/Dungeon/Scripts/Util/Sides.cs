using UnityEngine;

/*
 * Create and manage all the sides that can be used in the game
 */
namespace Dungeon
{
    public static class Sides{

        //Possible choices that can be chosen from
        public enum sideChoices
        {
            up,
            down,
            left,
            right,
            none
        }

        //Order need to be the same as SideChoices, is the position each side will have.
        public static IntVector2[] sideVector = {
            new IntVector2(0, 1),
            new IntVector2(0, -1),
            new IntVector2(-1, 0),
            new IntVector2(1, 0),
            new IntVector2(0, 0)
        };

        //Transform the enum SideChoices to its respective IntVector2 
        public static IntVector2 SideToVector(sideChoices side)
        {
            return sideVector[(int)side];
        }

        //Invert a side to its inverse (Ex: Up will become down)
        public static sideChoices invert(sideChoices side)
        {
            if (side == sideChoices.left)
                return sideChoices.right;
            if (side == sideChoices.right)
                return sideChoices.left;
            if (side == sideChoices.up)
                return sideChoices.down;
            if (side == sideChoices.down)
                return sideChoices.up;
            return sideChoices.none;
        }

        //Select a random side
        public static sideChoices RandomSide()
        {
            float value = Random.Range(0, 4);

            return (sideChoices)value;
        }


    }
}
