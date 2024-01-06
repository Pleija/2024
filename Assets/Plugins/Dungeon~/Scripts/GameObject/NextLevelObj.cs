namespace Dungeon
{
    /**
 * Take you to the next stage
 */

    public class NextLevelObj : InteractiveObj
    {
        //If player get this object
        public override void PlayerGet()
        {
            base.PlayerGet();
            //Add one more level to the generator
            DungeonGenerator.instance.level++;

            //Increase the dungeon size
            if(DungeonGenerator.instance.level % 2 == 1)
                DungeonGenerator.instance.xSize++;
            else
                DungeonGenerator.instance.zSize++;

            //Save Player status, life, strength, etc
            PlayerObj.playerInstance.SaveData();

            //Create a new Dungeon
            DungeonGenerator.instance.GenerateDungeon();
        }

    }
}
