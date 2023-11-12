using System.Collections;
using Runner.Characters;

namespace Runner.Consumable.Types
{
    public class Score2Multiplier : Consumable
    {
        public override string GetConsumableName() => "x2";
        public override ConsumableType GetConsumableType() => ConsumableType.SCORE_MULTIPLAYER;
        public override int GetPrice() => 750;
        public override int GetPremiumCost() => 0;

        public override IEnumerator Started(CharacterInputController c)
        {
            yield return base.Started(c);
            m_SinceStart = 0;
            c.trackManager.modifyMultiply += MultiplyModify;
        }

        public override void Ended(CharacterInputController c)
        {
            base.Ended(c);
            c.trackManager.modifyMultiply -= MultiplyModify;
        }

        protected int MultiplyModify(int multi) => multi * 2;
    }
}
