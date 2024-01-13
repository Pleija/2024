using System.Collections;
using Runner.Tracks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runner.Obstacles
{
    public class PatrollingObstacle : Obstacle
    {
        private static int s_SpeedRatioHash = Animator.StringToHash("SpeedRatio");
        private static int s_DeadHash = Animator.StringToHash("Dead");

        [Tooltip("Minimum time to cross all lanes.")]
        public float minTime = 2f;

        [Tooltip("Maximum time to cross all lanes.")]
        public float maxTime = 5f;

        [Tooltip("Leave empty if no animation")]
        public Animator animator;

        public AudioClip[] patrollingSound;
        public TrackSegment m_Segement;
        public Vector3 m_OriginalPosition = Vector3.zero;
        public float m_MaxSpeed;
        public float m_CurrentPos;
        public AudioSource m_Audio;
        private bool m_isMoving = false;
        public const float k_LaneOffsetToFullWidth = 2f;

        public override IEnumerator Spawn(TrackSegment segment, float t)
        {
            Vector3 position;
            Quaternion rotation;
            segment.GetPointAt(t, out position, out rotation);
            AsyncOperationHandle op = Addressables.InstantiateAsync(gameObject.name, position, rotation);
            yield return op;

            if (op.Result == null || !(op.Result is GameObject)) {
                Debug.LogWarning(string.Format("Unable to load obstacle {0}.", gameObject.name));
                yield break;
            }
            var obj = op.Result as GameObject;
            obj.transform.SetParent(segment.objectRoot, true);
            var po = obj.GetComponent<PatrollingObstacle>();
            po.m_Segement = segment;

            //TODO : remove that hack related to #issue7
            var oldPos = obj.transform.position;
            obj.transform.position += Vector3.back;
            obj.transform.position = oldPos;
            po.Setup();
        }

        public override void Setup()
        {
            m_Audio = GetComponent<AudioSource>();

            if (m_Audio != null && patrollingSound != null && patrollingSound.Length > 0) {
                m_Audio.loop = true;
                m_Audio.clip = patrollingSound[Random.Range(0, patrollingSound.Length)];
                m_Audio.Play();
            }
            m_OriginalPosition = transform.localPosition + transform.right * m_Segement.manager.laneOffset;
            transform.localPosition = m_OriginalPosition;
            var actualTime = Random.Range(minTime, maxTime);

            //time 2, becaus ethe animation is a back & forth, so we need the speed needed to do 4 lanes offset in the given time
            m_MaxSpeed = m_Segement.manager.laneOffset * k_LaneOffsetToFullWidth * 2 / actualTime;

            if (animator != null) {
                var clip = animator.GetCurrentAnimatorClipInfo(0)[0].clip;
                animator.SetFloat(s_SpeedRatioHash, clip.length / actualTime);
            }
            m_isMoving = true;
        }

        public override void Impacted()
        {
            m_isMoving = false;
            base.Impacted();
            if (animator != null) animator.SetTrigger(s_DeadHash);
        }

        private void Update()
        {
            if (!m_isMoving)
                return;
            m_CurrentPos += Time.deltaTime * m_MaxSpeed;
            transform.localPosition = m_OriginalPosition - transform.right *
                Mathf.PingPong(m_CurrentPos, m_Segement.manager.laneOffset * k_LaneOffsetToFullWidth);
        }
    }
}
