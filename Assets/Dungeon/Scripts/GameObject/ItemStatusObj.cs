namespace Dungeon
{
    /**
 * Base for itens that give a status, more life, more attack, more speed, etc
 */
    public class ItemStatusObj : InteractiveObj {

        //How much life gives
        public int giveLife = 0;
        //How much strength gives
        public int giveStr = 0;

        //Once a player get
        public override void PlayerGet()
        {
            base.PlayerGet();

            //Get the status of the player
            CharStatus playerStatus = PlayerObj.playerInstance.status;

            //Give life
            playerStatus.currLife += giveLife;
            //Give strength
            playerStatus.strengh += giveStr;
            //Destroy this item
            Destroy(gameObject);
        }

    }
}
