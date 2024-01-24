#region
using System.Collections.Generic;
#endregion

namespace ParadoxNotion
{
    ///<summary>A simple general purpose hierarchical tree.</summary>
    public class HierarchyTree
    {
        //..with nothing inside right now

        ///<summary>A simple general purpose hierarchical tree element.</summary>
        public class Element
        {
            private List<Element> _children;
            public Element(object reference) => this.reference = reference;
            public object reference { get; }
            public Element parent { get; private set; }
            public IEnumerable<Element> children => _children;

            ///<summary>Add a child element</summary>
            public Element AddChild(Element child)
            {
                if (_children == null) _children = new List<Element>();
                child.parent = this;
                _children.Add(child);
                return child;
            }

            ///<summary>Remove a child element</summary>
            public void RemoveChild(Element child)
            {
                if (_children != null) _children.Remove(child);
            }

            ///<summary>Get root element</summary>
            public Element GetRoot()
            {
                var current = parent;
                while (current != null) current = current.parent;
                return current;
            }

            ///<summary>Returns the first found Element that references target object</summary>
            public Element FindReferenceElement(object target)
            {
                if (reference == target) return this;
                if (_children == null) return null;

                for (var i = 0; i < _children.Count; i++) {
                    var sub = _children[i].FindReferenceElement(target);
                    if (sub != null) return sub;
                }
                return null;
            }

            ///<summary>Get first parent reference of type T, including self element</summary>
            public T GetFirstParentReferenceOfType<T>()
            {
                if (reference is T) return (T)reference;
                return parent != null ? parent.GetFirstParentReferenceOfType<T>() : default;
            }

            ///<summary>Get all children references of type T recursively</summary>
            public IEnumerable<T> GetAllChildrenReferencesOfType<T>()
            {
                if (_children == null) yield break;

                for (var i = 0; i < _children.Count; i++) {
                    var element = _children[i];
                    if (element.reference is T) yield return (T)element.reference;
                    foreach (var deep in element.GetAllChildrenReferencesOfType<T>())
                        yield return deep;
                }
            }
        }
    }
}
