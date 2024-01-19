using System.Collections;
using Runner.Tracks;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runner.Obstacles
{
    public class AllLaneObstacle : Obstacle
    {
        public override IEnumerator Spawn(TrackSegment segment, float t)
        {
            Vector3 position;
            Quaternion rotation;
            segment.GetPointAt(t, out position, out rotation);
            var op = Addressables.LoadAssetAsync<GameObject>(gameObject.name);
            yield return op;

            if (!(op.Result is { })) {
                Debug.LogWarning(string.Format("Unable to load obstacle {0}.", gameObject.name));
                yield break;
            }
            var obj = Instantiate(op.Result, position, rotation);
            obj.OnDestroyAsObservable().Subscribe(() => {
                if (op.IsValid()) Addressables.Release(op);
            });
            obj.transform.SetParent(segment.objectRoot, true);

            //TODO : remove that hack related to #issue7
            var oldPos = obj.transform.position;
            obj.transform.position += Vector3.back;
            obj.transform.position = oldPos;
        }
    }
}
