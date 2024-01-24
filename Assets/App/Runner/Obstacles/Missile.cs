#region
using System.Collections;
using Runner.Tracks;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
#endregion

namespace Runner.Obstacles
{
    /// <summary>
    ///     Obstacle that starts moving forward in its lane when the player is close enough.
    /// </summary>
    public class Missile : Obstacle
    {
        public const int k_LeftMostLaneIndex = -1;
        public const int k_RightMostLaneIndex = 1;
        public const float k_Speed = 5f;
        private static int s_DeathHash = Animator.StringToHash("Death");
        private static int s_RunHash = Animator.StringToHash("Run");
        public Animator animator;
        public AudioClip[] movingSound;
        public TrackSegment m_OwnSegement;
        public bool m_IsMoving;
        public AudioSource m_Audio;
        public bool m_Ready { get; set; }

        public void Awake()
        {
            m_Audio = GetComponent<AudioSource>();
        }

        public void Update()
        {
            if (m_Ready && m_OwnSegement.manager.isMoving) {
                if (m_IsMoving) {
                    transform.position += transform.forward * k_Speed * Time.deltaTime;
                }
                else {
                    if (TrackManager.instance.segments[1] == m_OwnSegement) {
                        if (animator != null) animator.SetTrigger(s_RunHash);

                        if (m_Audio != null && movingSound != null && movingSound.Length > 0) {
                            m_Audio.clip = movingSound[Random.Range(0, movingSound.Length)];
                            m_Audio.Play();
                            m_Audio.loop = true;
                        }
                        m_IsMoving = true;
                    }
                }
            }
        }

        public override IEnumerator Spawn(TrackSegment segment, float t)
        {
            var lane = Random.Range(k_LeftMostLaneIndex, k_RightMostLaneIndex + 1);
            Vector3 position;
            Quaternion rotation;
            segment.GetPointAt(t, out position, out rotation);
            var op = Addressables.LoadAssetAsync<GameObject>(gameObject.name);
            yield return op;

            if (!(op.Result is { })) {
                Debug.LogWarning(string.Format("Unable to load obstacle {0}.", gameObject.name));
                yield break;
            }
            var obj = Instantiate(op.Result, position, rotation); // as GameObject;
            obj.OnDestroyAsObservable()
                    .Subscribe(() => {
                        if (op.IsValid()) Addressables.Release(op);
                    });
            obj.transform.SetParent(segment.objectRoot, true);
            obj.transform.position += obj.transform.right * lane * segment.manager.laneOffset;
            obj.transform.forward = -obj.transform.forward;
            var missile = obj.GetComponent<Missile>();
            missile.m_OwnSegement = segment;

            //TODO : remove that hack related to #issue7
            var oldPos = obj.transform.position;
            obj.transform.position += Vector3.back;
            obj.transform.position = oldPos;
            missile.Setup();
        }

        public override void Setup()
        {
            m_Ready = true;
        }

        public override void Impacted()
        {
            base.Impacted();
            if (animator != null) animator.SetTrigger(s_DeathHash);
        }
    }
}
