using System.Collections;
using Runner.Characters;

namespace Runner.Consumable.Types
{
    public class ExtraLife : Consumable
    {
        public const int k_MaxLives = 3;
        public const int k_CoinValue = 10;
        public override string GetConsumableName() => "Life";
        public override ConsumableType GetConsumableType() => ConsumableType.EXTRALIFE;
        public override int GetPrice() => 2000;
        public override int GetPremiumCost() => 5;

        public override bool CanBeUsed(CharacterInputController c)
        {
            if (c.currentLife == c.maxLife) return false;
            return true;
        }

        public override IEnumerator Started(CharacterInputController c)
        {
            yield return base.Started(c);
            if (c.currentLife < k_MaxLives)
                c.currentLife += 1;
            else
                c.coins += k_CoinValue;
        }
    }
}
