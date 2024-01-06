using UnityEngine;

namespace Dungeon
{
    /**
 * Object is a wall
 */
    public class WallObj : BaseObj {

        public override void Start()
        {
            base.Start();
            //For Unity Objcts, that have pivot at center, lift them half position from ground
            transform.Translate(Vector3.up *0.5f);
        }

        void Reset()
        {
            ObjType = Type.wall;
        }
    }
}
