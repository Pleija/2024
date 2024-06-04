namespace Dungeon
{
    /**
 * Set a Item collection to appear from level X to level Y
 * It can be set to appear on all stages
 */
    [System.Serializable]
    public class LevelPrefabs {

        //Appear on any stage of the dungeon
        public bool AppearInAllLevels = false;
        //Start appearing from this level
        public int AppearFromLevel = 0;
        //Appear until this level
        public int ApperToLevel = 0;

        //Collection that will appear between this levels.
        public DungeonPrefabs prefabs;

    }
}
