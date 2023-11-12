using Runner.Characters;
using UnityEngine;

namespace Runner.Consumable.Types
{
    public class CoinMagnet : Consumable
    {
        protected readonly Vector3 k_HalfExtentsBox = new Vector3(20.0f, 1.0f, 1.0f);
        protected const int k_LayerMask = 1 << 8;
        public override string GetConsumableName() => "Magnet";
        public override ConsumableType GetConsumableType() => ConsumableType.COIN_MAG;
        public override int GetPrice() => 750;
        public override int GetPremiumCost() => 0;
        protected Collider[] returnColls = new Collider[20];

        public override void Tick(CharacterInputController c)
        {
            base.Tick(c);
            var nb = Physics.OverlapBoxNonAlloc(c.characterCollider.transform.position,
                k_HalfExtentsBox, returnColls, c.characterCollider.transform.rotation, k_LayerMask);

            for(var i = 0; i < nb; ++i) {
                var returnCoin = returnColls[i].GetComponent<Coin>();

                if(returnCoin != null && !returnCoin.isPremium &&
                   !c.characterCollider.magnetCoins.Contains(returnCoin.gameObject)) {
                    returnColls[i].transform.SetParent(c.transform);
                    c.characterCollider.magnetCoins.Add(returnColls[i].gameObject);
                }
            }
        }
    }
}
