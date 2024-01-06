using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    /**
 * The projectile is a arrow
 */

    public class Arrow : ProjectileBase {

        //Speed of the arrow
        public float speed = 8f;
        //Direction of the arrpw
        Vector3 dir;

        public override void Start()
        {
            base.Start();
            //Direction to move arrow
            dir = (target.transform.position - transform.position).normalized;
            dir.y = 0;
            //Rotate arrow to face target
            transform.LookAt(target.transform.position);
        }

        public override void Update()
        {
            base.Update();
            //Move arrow
            transform.Translate(dir * speed * Time.deltaTime, Space.World);

            //Get position on grid
            IntVector2 pos = Position();

            //If out of bounds, of parent died, destroy it. 
            if (!ObjectManager.InsideBounds(pos) || parent == null || parent.gameObject == null)
            {
                Destroy(gameObject);
                return;
            }

            //Get objcts at current position
            List<BaseObj> objs = ObjectManager.GetObjectsAt(pos);


            foreach (BaseObj obj in objs)
            {
                //If obj is not interactive, hit it.
                if (obj != null && obj.gameObject != parent.gameObject && obj.ObjType != BaseObj.Type.interactive)
                {
                    //If object is killable, damage it.
                    if (typeof(KillableObj).IsAssignableFrom(obj.GetType()))
                    {
                        (obj as KillableObj).Damage(damage);
                    }
                    //Destroy arrow
                    Destroy(gameObject);
                }
            }
        }
    }
}
