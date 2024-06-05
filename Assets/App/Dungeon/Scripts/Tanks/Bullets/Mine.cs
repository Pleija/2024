using System.Collections;
using UnityEngine;

namespace TankShooter
{
    public class Mine : BaseBullet {

        public float destroyAfterSeconds = 5f;

        // Use this for initialization
        void Start () {
	
        }
	
        // Update is called once per frame
        void Update () {
	
        }

        void OnEnable() {
            StartCoroutine(ExplodeAfterSeconds());
        }

        IEnumerator ExplodeAfterSeconds() {
            yield return new WaitForSeconds(destroyAfterSeconds);
            Explode();
        }

        public override void StartMove(Target target) {
            base.StartMove(target);
        }

        void OnCollisionEnter (Collision collision) {
            CheckCollisionWithGameObjects(collision, false);
        }

    }
}
