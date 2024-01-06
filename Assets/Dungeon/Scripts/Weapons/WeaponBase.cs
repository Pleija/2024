using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    [System.Serializable]
    public class WeaponBase{

        public enum Type
        {
            dagger,
            sword,
            pole
        }

        public Type type;
        public float minAttack = 5;
        public float maxAttack = 8;
        public Sprite Image;

        public KillableObj[] Hit(IntVector2 pos, Sides.sideChoices attackSide)
        {
            List<KillableObj> list = new List<KillableObj>();
            List<IntVector2> attackPos = new List<IntVector2>();

            switch (type)
            {
                case Type.dagger:
                    attackPos.Add(pos + Sides.SideToVector(attackSide));
                    break;
                case Type.pole:
                    attackPos.Add(pos + Sides.SideToVector(attackSide));
                    attackPos.Add(pos + (2 * Sides.SideToVector(attackSide)));
                    break;
                case Type.sword:
                    attackPos.Add(pos + Sides.SideToVector(attackSide));
                    if (attackSide == Sides.sideChoices.left || attackSide == Sides.sideChoices.right)
                    {
                        attackPos.Add(pos + Sides.SideToVector(attackSide) + Sides.SideToVector(Sides.sideChoices.up));
                        attackPos.Add(pos + Sides.SideToVector(attackSide) + Sides.SideToVector(Sides.sideChoices.down));
                    }
                    else
                    {
                        attackPos.Add(pos + Sides.SideToVector(attackSide) + Sides.SideToVector(Sides.sideChoices.left));
                        attackPos.Add(pos + Sides.SideToVector(attackSide) + Sides.SideToVector(Sides.sideChoices.right));
                    }
                    break;
            }

            List<KillableObj> tempList = new List<KillableObj>();
            List<Vector3> hitPos = new List<Vector3>();
            List<Vector3> missPos = new List<Vector3>();

            for (int i = 0; i < attackPos.Count; i++)
            {
                tempList = ObjectManager.GetObjectsAt<KillableObj>(attackPos[i]);
                if (tempList.Count != 0)
                {
                    hitPos.Add(new Vector3(attackPos[i].x, 1, attackPos[i].z));
                
                    list.AddRange(tempList);
                }
                else
                {
                    missPos.Add(new Vector3(attackPos[i].x, 1, attackPos[i].z));
              
                }
                tempList.Clear();
            }

            if (hitPos.Count != 0)
            {
                for (int i = 0; i < hitPos.Count; i++)
                {
                    GameObject.Instantiate(ObjectPrefabs.instance.OnAttackHit, hitPos[i], ObjectPrefabs.instance.OnAttackHit.transform.rotation);
                }
                for (int i = 0; i < missPos.Count; i++)
                {
                    GameObject.Instantiate(ObjectPrefabs.instance.OnAttackMiss, missPos[i], ObjectPrefabs.instance.OnAttackHit.transform.rotation);
                }
            }

            return list.ToArray();
        }

        public float GetAttack()
        {
            return Random.Range(minAttack, maxAttack);
        }

    }
}
