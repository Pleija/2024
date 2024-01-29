using System;
using Sirenix.Utilities;
using Unity.Collections;
using Unity.Entities;

namespace Runtime.Extensions
{
    public static class XEntity
    {
        public static NativeArray<Entity> ToEntities(this EntityQuery aQuery, Action<Entity> aAction) {
            return ToEntitiesAction(aQuery, aAction);
        }

        public static NativeArray<Entity> ToEntities(this EntityQuery aQuery, Action<Entity, EntityQuery> aAction) {
            return ToEntitiesAction(aQuery, aAction);
        }

        public static NativeArray<Entity> ToEntities(this EntityQuery aQuery,
            Action<Entity, EntityQuery, NativeArray<Entity>> aAction) {
            return ToEntitiesAction(aQuery, aAction);
        }

        public static NativeArray<Entity> ToEntitiesAction(this EntityQuery aQuery, Delegate aAction) {
            if (aAction != null) {
                using (var tArray = aQuery.ToEntityArray(Allocator.TempJob)) {
                    tArray.ForEach(e => {
                        if (aAction is Action<Entity, EntityQuery> ta)
                            ta.Invoke(e, aQuery);
                        else if (aAction is Action<Entity> tb)
                            tb.Invoke(e);
                        else if (aAction is Action<Entity, EntityQuery, NativeArray<Entity>> tc)
                            tc.Invoke(e, aQuery, tArray);
                    });
                }

                return default;
            }

            return aQuery.ToEntityArray(Allocator.TempJob);
        }

//        public static NativeArray<Entity> ToEntities(this EntityQuery aQuery, Action<Entity> aAction)
//        {
//            if (aAction != null) {
//                using (var tArray = aQuery.ToEntityArray(Allocator.TempJob)) {
//                    tArray.ForEach(aAction.Invoke);
//                }
//
//                return default;
//            }
//
//            return aQuery.ToEntityArray(Allocator.TempJob);
//        }

        public static NativeArray<Entity> Each(this NativeArray<Entity> aEntities, Action<Entity> aAction) {
            if (aAction != null) {
                using (aEntities) {
                    aEntities.ForEach(aAction);
                }

                return default;
            }

            return aEntities;
        }
    }
}
