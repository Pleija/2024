#region
using System.Collections;
using Runner.Characters;
#endregion

namespace Runner.Consumable.Types
{
    public class Invincibility : Consumable
    {
        public override string GetConsumableName() => "Invincible";
        public override ConsumableType GetConsumableType() => ConsumableType.INVINCIBILITY;
        public override int GetPrice() => 1500;
        public override int GetPremiumCost() => 5;

        public override void Tick(CharacterInputController c)
        {
            base.Tick(c);
            c.characterCollider.SetInvincibleExplicit(true);
        }

        public override IEnumerator Started(CharacterInputController c)
        {
            yield return base.Started(c);
            c.characterCollider.SetInvincible(duration);
        }

        public override void Ended(CharacterInputController c)
        {
            base.Ended(c);
            c.characterCollider.SetInvincibleExplicit(false);
        }
    }
}
