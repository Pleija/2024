#region
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Collections/Lists")]
    public class ClearList : CallableFunctionNode<IList, IList>
    {
        public override IList Invoke(IList list)
        {
            list.Clear();
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class AddListItem<T> : CallableFunctionNode<IList<T>, List<T>, T>
    {
        public override IList<T> Invoke(List<T> list, T item)
        {
            list.Add(item);
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class InsertListItem<T> : CallableFunctionNode<IList<T>, List<T>, int, T>
    {
        public override IList<T> Invoke(List<T> list, int index, T item)
        {
            list.Insert(index, item);
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class RemoveListItem<T> : CallableFunctionNode<IList<T>, List<T>, T>
    {
        public override IList<T> Invoke(List<T> list, T item)
        {
            list.Remove(item);
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class RemoveListItemAt<T> : CallableFunctionNode<IList<T>, List<T>, int>
    {
        public override IList<T> Invoke(List<T> list, int index)
        {
            list.RemoveAt(index);
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class SetListItem<T> : CallableFunctionNode<IList<T>, IList<T>, int, T>
    {
        public override IList<T> Invoke(IList<T> list, int index, T item)
        {
            try {
                list[index] = item;
            }
            catch (Exception e) {
                Logger.LogException(e, LogTag.EXECUTION, parentNode);
            }
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class ShuffleList<T> : CallableFunctionNode<IList<T>, IList<T>>
    {
        public override IList<T> Invoke(IList<T> list)
        {
            for (var i = list.Count - 1; i > 0; i--) {
                var j = (int)Mathf.Floor(UnityEngine.Random.value * (i + 1));
                var temp = list[i];
                list[i] = list[j];
                list[j] = temp;
            }
            return list;
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class GetListItem<T> : PureFunctionNode<T, IList<T>, int>
    {
        public override T Invoke(IList<T> list, int index)
        {
            try {
                return list[index];
            }
            catch {
                return default;
            }
        }
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class GetRandomListItem<T> : PureFunctionNode<T, IList<T>>
    {
        public override T Invoke(IList<T> list) =>
                list.Count > 0 ? list[UnityEngine.Random.Range(0, list.Count)] : default;
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class GetLastListItem<T> : PureFunctionNode<T, IList<T>>
    {
        public override T Invoke(IList<T> list) => list.LastOrDefault();
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class GetFirstListItem<T> : PureFunctionNode<T, IList<T>>
    {
        public override T Invoke(IList<T> list) => list.FirstOrDefault();
    }

    [Category("Collections/Lists"), ExposeAsDefinition]
    public class GetListItemIndex : PureFunctionNode<int, IList, object>
    {
        public override int Invoke(IList list, object item) => list.IndexOf(item);
    }
}
