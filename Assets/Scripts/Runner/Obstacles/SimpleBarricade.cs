using System.Collections;
using Runner.Tracks;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runner.Obstacles
{
    public class SimpleBarricade : Obstacle
    {
        public const int k_MinObstacleCount = 1;
        public const int k_MaxObstacleCount = 2;
        public const int k_LeftMostLaneIndex = -1;
        public const int k_RightMostLaneIndex = 1;

        public override IEnumerator Spawn(TrackSegment segment, float t)
        {
            //the tutorial very firts barricade need to be center and alone, so player can swipe safely in bother direction to avoid it
            var isTutorialFirst = TrackManager.instance.isTutorial && TrackManager.instance.firstObstacle &&
                segment == segment.manager.currentSegment;
            if (isTutorialFirst)
                TrackManager.instance.firstObstacle = false;
            var count = isTutorialFirst ? 1 : Random.Range(k_MinObstacleCount, k_MaxObstacleCount + 1);
            var startLane = isTutorialFirst ? 0 : Random.Range(k_LeftMostLaneIndex, k_RightMostLaneIndex + 1);
            Vector3 position;
            Quaternion rotation;
            segment.GetPointAt(t, out position, out rotation);

            for (var i = 0; i < count; ++i) {
                var lane = startLane + i;
                lane = lane > k_RightMostLaneIndex ? k_LeftMostLaneIndex : lane;
                var op = Addressables.LoadAssetAsync<GameObject>(gameObject.name);
                yield return op;

                if (op.Result == null) {
                    Debug.LogWarning(string.Format("Unable to load obstacle {0}.", gameObject.name));
                    yield break;
                }
                var obj = Instantiate(op.Result, position, rotation); //  as GameObject;
                obj.OnDestroyAsObservable().Subscribe(() => {
                    if (op.IsValid()) Addressables.Release(op);
                });

                if (obj == null) {
                    Debug.Log(gameObject.name);
                }
                else {
                    obj.transform.position += obj.transform.right * lane * segment.manager.laneOffset;
                    obj.transform.SetParent(segment.objectRoot, true);

                    //TODO : remove that hack related to #issue7
                    var oldPos = obj.transform.position;
                    obj.transform.position += Vector3.back;
                    obj.transform.position = oldPos;
                }
            }
        }
    }
}
