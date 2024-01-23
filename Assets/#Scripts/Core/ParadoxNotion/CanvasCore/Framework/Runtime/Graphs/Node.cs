using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using HashidsNet;
using MoreTags;
using NodeCanvas.Framework.Internal;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using ParadoxNotion.Serialization.FullSerializer;
using ParadoxNotion.Services;
using Puerts;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.Serialization;
using Zu.TypeScript;
using Zu.TypeScript.Change;
using Zu.TypeScript.TsTypes;
using Logger = ParadoxNotion.Services.Logger;
using MissingNode = NodeCanvas.Framework.Internal.MissingNode;

namespace NodeCanvas.Framework
{
    ///<summary>The base class for all nodes that can live in a NodeCanvas Graph</summary>
#if UNITY_EDITOR //handles missing Nodes
    [fsObject(Processor = typeof(fsRecoveryProcessor<Node, MissingNode>)), SpoofAOT, System.Serializable
     , fsSerializeAsReference, fsDeserializeOverwrite]
#endif
    public abstract partial class Node : IGraphElement, ISerializationCollectable
    {
        //todo: add
        [FormerlySerializedAs("BindComponent")]
        public Component bindComponent;

        public MtsFile mtsFile;
        public JSObject jsBind { get; set; }
        public string FsmName => graphAgent.name.Split(' ').First();
        public string NodeName => name.RegexReplace(@"\W+", "");

        ///<summary>The local blackboard of the graph where parentBlackboard if any is parented to</summary>
        public IBlackboard blackboard => localBlackboard ??= new BlackboardSource();

        [fsSerializeAs("localBlackboard")]
        private BlackboardSource _localBlackboard;

        ///<summary>The local blackboard of the graph</summary>
        public BlackboardSource localBlackboard {
            get { return _localBlackboard ??= new BlackboardSource(); }
            set => _localBlackboard = value;
        }

        //----------------------------------------------------------------------------------------------
        /// <summary>
        ///     Add on an IList (list/array) field to autosort it automatically when the children nodes are autosorted. Thus
        ///     keeping the collection the same in respects to the children. Related only to tree graphs.
        /// </summary>
        [System.AttributeUsage(System.AttributeTargets.Field)]
        protected class AutoSortWithChildrenConnections : System.Attribute { }

        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private string _UID;

        [SerializeField]
        private string _name;

        [SerializeField]
        private string _tag;

        [SerializeField]
        private TagDataList _preTags = new TagDataList();

        [SerializeField]
        private TagDataList _postTags = new TagDataList();

        [SerializeField, fsIgnoreInBuild]
        private Vector2 _position;

        [SerializeField, fsIgnoreInBuild]
        private string _comment;

        [SerializeField, fsIgnoreInBuild]
        private bool _isBreakpoint;

        //reconstructed OnDeserialization
        private Graph _graph;

        //reconstructed OnDeserialization
        private int _ID;

        //reconstructed OnDeserialization
        private List<Connection> _inConnections = new List<Connection>();

        //reconstructed OnDeserialization
        private List<Connection> _outConnections = new List<Connection>();

        [System.NonSerialized]
        private Status _status = Status.Resting;

        [System.NonSerialized]
        private string _nameCache;

        [System.NonSerialized]
        private string _descriptionCache;

        [System.NonSerialized]
        private int _priorityCache = int.MinValue;
        //

        ///<summary>The graph this node belongs to.</summary>
        public Graph graph {
            get => _graph;
            internal set => _graph = value;
        }

        ///<summary>The node's int index ID in the graph. This is not persistant in any way. Use UID for that.</summary>
        public int ID {
            get => _ID;
            internal set => _ID = value;
        }

        ///<summary>The Unique ID of the node. One is created only if requested.</summary>
        public string UID => string.IsNullOrEmpty(_UID) ? _UID = System.Guid.NewGuid().ToString() : _UID;

        ///<summary>All incomming connections to this node.</summary>
        public List<Connection> inConnections {
            get => _inConnections;
            protected set => _inConnections = value;
        }

        ///<summary>All outgoing connections from this node.</summary>
        public List<Connection> outConnections {
            get => _outConnections;
            protected set => _outConnections = value;
        }

        ///<summary>The position of the node in the graph.</summary>
        public Vector2 position {
            get => _position;
            set => _position = value;
        }

        ///<summary>The custom title name of the node if any.</summary>
        public string customName {
            get => _name;
            set => _name = value;
        }

        ///<summary>The node tag. Useful for finding nodes through code.</summary>
        public string tag {
            get => _tag;
            set => _tag = value;
        }

        public TagDataList preTags {
            get => _preTags ??= new TagDataList();
            set => _preTags = value;
        }

        public TagDataList postTags {
            get => _postTags ??= new TagDataList();
            set => _postTags = value;
        }

        // #if UNITY_EDITOR
        //         public TagGUI preTagGUI;
        //         public TagGUI postTagGUI;
        // #endif

        ///<summary>The comments of the node if any.</summary>
        public string comments {
            get => _comment;
            set => _comment = value;
        }

        ///<summary>Is the node set as a breakpoint?</summary>
        public bool isBreakpoint {
            get => _isBreakpoint;
            set => _isBreakpoint = value;
        }

        ///<summary>The title name of the node. This is virtual so title name may change instance wise</summary>
        public virtual string name {
            get {
                if (!string.IsNullOrEmpty(customName)) return customName;
                if (mtsFile) return Path.GetFileNameWithoutExtension(mtsFile.assetPath);
                var id = new Hashids("NodeName", 4);
                customName = $"_{id.Encode(graph.HashIdMax += 1)}";
                return customName;

                if (string.IsNullOrEmpty(_nameCache)) {
                    var nameAtt = GetType().RTGetAttribute<NameAttribute>(true);
                    _nameCache = nameAtt != null ? nameAtt.name : GetType().FriendlyName().SplitCamelCase();
                }
                return _nameCache;
            }
            set => customName = value;
        }

        ///<summary>The description info of the node</summary>
        public virtual string description {
            get {
                if (string.IsNullOrEmpty(_descriptionCache)) {
                    var descAtt = GetType().RTGetAttribute<DescriptionAttribute>(true);
                    _descriptionCache = descAtt != null ? descAtt.description : "No Description";
                }
                return _descriptionCache;
            }
        }

        ///<summary>The execution priority order of the node when it matters to the graph system</summary>
        public virtual int priority {
            get {
                if (_priorityCache == int.MinValue) {
                    var prioAtt = GetType().RTGetAttribute<ExecutionPriorityAttribute>(true);
                    _priorityCache = prioAtt != null ? prioAtt.priority : 0;
                }
                return _priorityCache;
            }
        }

        ///<summary>The numer of possible inputs. -1 for infinite.</summary>
        public abstract int maxInConnections { get; }

        ///<summary>The numer of possible outputs. -1 for infinite.</summary>
        public abstract int maxOutConnections { get; }

        ///<summary>The output connection Type this node has.</summary>
        public abstract System.Type outConnectionType { get; }

        ///<summary>Can this node be set as prime (Start)?</summary>
        public abstract bool allowAsPrime { get; }

        ///<summary>Can this node connect to itself?</summary>
        public abstract bool canSelfConnect { get; }

        ///<summary>Alignment of the comments when shown (editor).</summary>
        public abstract Alignment2x2 commentsAlignment { get; }

        ///<summary>Alignment of the icons (editor).</summary>
        public abstract Alignment2x2 iconAlignment { get; }

        ///<summary>The current status of the node</summary>
        public Status status {
            get => _status;
            protected set {
                if (_status == Status.Resting && value == Status.Running) timeStarted = graph.elapsedTime;
                _status = value;
            }
        }

        ///<summary>The current agent.</summary>
        public Component graphAgent => graph != null ? graph.agent : null;

        ///<summary>The current blackboard.</summary>
        public IBlackboard graphBlackboard => graph != null ? graph.blackboard : null;

        ///<summary>The time in seconds the node has been Status.Running after a reset (Status.Resting)</summary>
        public float elapsedTime => status == Status.Running ? graph.elapsedTime - timeStarted : 0;

        //Mark when status running change
        private float timeStarted { get; set; }

        //Used to check recursion
        private bool isChecked { get; set; }

        //Used to flag breakpoint reached
        private bool breakPointReached { get; set; }

        ///----------------------------------------------------------------------------------------------
        ///----------------------------------------------------------------------------------------------

        //required
        public Node()
        {
            /*_UID = System.Guid.NewGuid().ToString();*/
        }

        ///<summary>Create a new Node of type and assigned to the provided graph. Use this for constructor</summary>
        public static Node Create(Graph targetGraph, System.Type nodeType, Vector2 pos)
        {
            if (targetGraph == null) {
                Logger.LogError("Can't Create a Node without providing a Target Graph", LogTag.GRAPH);
                return null;
            }
            if (nodeType.IsGenericTypeDefinition)
                nodeType = nodeType.RTMakeGenericType(nodeType.GetFirstGenericParameterConstraintType());
            var newNode = (Node)System.Activator.CreateInstance(nodeType);
            UndoUtility.RecordObject(targetGraph, "Create Node");
            newNode.graph = targetGraph;
            newNode.position = pos;
            BBParameter.SetBBFields(newNode, targetGraph.blackboard);
            newNode.Validate(targetGraph);
            newNode.OnCreate(targetGraph);
            UndoUtility.SetDirty(targetGraph);
            return newNode;
        }

        ///<summary>Duplicate node alone assigned to the provided graph</summary>
        public Node Duplicate(Graph targetGraph)
        {
            if (targetGraph == null) {
                Logger.LogError("Can't duplicate a Node without providing a Target Graph", LogTag.GRAPH);
                return null;
            }

            //deep clone
            var newNode = JSONSerializer.Clone<Node>(this);
            UndoUtility.RecordObject(targetGraph, "Duplicate Node");
            targetGraph.allNodes.Add(newNode);
            newNode.inConnections.Clear();
            newNode.outConnections.Clear();
            if (targetGraph == graph) newNode.position += new Vector2(50, 50);
            newNode._UID = null;
            newNode.graph = targetGraph;
            BBParameter.SetBBFields(newNode, targetGraph.blackboard);
            foreach (var task in Graph.GetTasksInElement(newNode)) task.Validate(targetGraph);
            //--
            newNode.Validate(targetGraph);
            UndoUtility.SetDirty(targetGraph);
            return newNode;
        }

        ///<summary>Validate the node in it's graph</summary>
        public void Validate(Graph assignedGraph)
        {
            OnValidate(assignedGraph);
            var hardError = GetHardError();
            if (hardError != null) Logger.LogError(hardError, LogTag.VALIDATION, this);
            if (this is IGraphAssignable) (this as IGraphAssignable).ValidateSubGraphAndParameters();
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>The main execution function of the node. Execute the node for the agent and blackboard provided.</summary>
        public Status Execute(Component agent, IBlackboard blackboard)
        {
            if (!graph.isRunning) return status;
#if UNITY_EDITOR
            if (isBreakpoint) {
                if (status == Status.Resting) {
                    var breakEditor = Editor.Prefs.breakpointPauseEditor;
                    var owner = agent as GraphOwner;
                    var contextName = owner != null ? owner.gameObject.name : graph.name;
                    Logger.LogWarning(
                        string.Format("Node: '{0}' | ID: '{1}' | Graph Type: '{2}' | Context Object: '{3}'", name, ID
                            , graph.GetType().Name, contextName), "Breakpoint", this);
                    if (owner != null) owner.PauseBehaviour();
                    if (breakEditor)
                        StartCoroutine(YieldBreak(() => {
                            if (owner != null) owner.StartBehaviour();
                        }));
                    breakPointReached = true;
                    return status = Status.Running;
                }

                if (breakPointReached) {
                    breakPointReached = false;
                    status = Status.Resting;
                }
            }
#endif
            return status = OnExecute(agent, blackboard);
        }

        ///<summary>Recursively reset the node and child nodes if it's not Resting already</summary>
        public void Reset(bool recursively = true)
        {
            if (status == Status.Resting || isChecked) return;
            OnReset();
            status = Status.Resting;
            isChecked = true;
            for (var i = 0; i < outConnections.Count; i++) outConnections[i].Reset(recursively);
            isChecked = false;
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Helper for breakpoints</summary>
        private IEnumerator YieldBreak(System.Action resume)
        {
            Debug.Break();
            yield return null;
            resume();
        }

        ///<summary>Helper for easier logging</summary>
        public Status Error(object msg)
        {
            if (msg is System.Exception)
                Logger.LogException((System.Exception)msg, LogTag.EXECUTION, this);
            else
                Logger.LogError(msg, LogTag.EXECUTION, this);
            status = Status.Error;
            return Status.Error;
        }

        ///<summary>Helper for easier logging</summary>
        public Status Fail(string msg)
        {
            Logger.LogError(msg, LogTag.EXECUTION, this);
            status = Status.Failure;
            return Status.Failure;
        }

        ///<summary>Helper for easier logging</summary>
        public void Warn(string msg)
        {
            Logger.LogWarning(msg, LogTag.EXECUTION, this);
        }

        ///<summary>Set the Status of the node directly. Not recomended if you don't know why!</summary>
        public void SetStatus(Status status)
        {
            this.status = status;
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Sends an event to the graph (same as calling graph.SendEvent)</summary>
        protected void SendEvent(string eventName)
        {
            graph.SendEvent(eventName, null, this);
        }

        ///<summary>Sends an event to the graph (same as calling graph.SendEvent)</summary>
        protected void SendEvent<T>(string eventName, T value)
        {
            graph.SendEvent(eventName, value, this);
        }

        /// ----------------------------------------------------------------------------------------------
        /// <summary>
        ///     Returns whether source and target nodes can generaly be connected together. This only validates max in/out
        ///     connections that source and target nodes has, along with other validations. Providing an existing refConnection,
        ///     will bypass source/target validation respectively if that connection is already connected to that source/target
        ///     node.
        /// </summary>
        public static bool IsNewConnectionAllowed(Node sourceNode, Node targetNode, Connection refConnection = null)
        {
            if (sourceNode == null || targetNode == null) {
                Logger.LogWarning("A Node Provided is null.", LogTag.EDITOR, targetNode);
                return false;
            }

            if (sourceNode == targetNode && !sourceNode.canSelfConnect) {
                Logger.LogWarning("Node can't connect to itself.", LogTag.EDITOR, targetNode);
                return false;
            }

            if (refConnection == null || refConnection.sourceNode != sourceNode)
                if (sourceNode.outConnections.Count >= sourceNode.maxOutConnections &&
                    sourceNode.maxOutConnections != -1) {
                    Logger.LogWarning("Source node can have no more out connections.", LogTag.EDITOR, sourceNode);
                    return false;
                }

            if (refConnection == null || refConnection.targetNode != targetNode)
                if (targetNode.maxInConnections <= targetNode.inConnections.Count &&
                    targetNode.maxInConnections != -1) {
                    Logger.LogWarning("Target node can have no more in connections.", LogTag.EDITOR, targetNode);
                    return false;
                }
            var final = true;
            final &= sourceNode.CanConnectToTarget(targetNode);
            final &= targetNode.CanConnectFromSource(sourceNode);
            return final;
        }

        ///<summary>Override for explicit handling</summary>
        protected virtual bool CanConnectToTarget(Node targetNode) => true;

        ///<summary>Override for explicit handling</summary>
        protected virtual bool CanConnectFromSource(Node sourceNode) => true;

        ///<summary>Are provided nodes connected at all regardless of parent/child relation?</summary>
        public static bool AreNodesConnected(Node a, Node b)
        {
            Debug.Assert(a != null && b != null, "Null nodes");
            var conditionA = a.outConnections.FirstOrDefault(c => c.targetNode == b) != null;
            var conditionB = b.outConnections.FirstOrDefault(c => c.targetNode == a) != null;
            return conditionA || conditionB;
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Nodes can use coroutine as normal through MonoManager.</summary>
        public Coroutine StartCoroutine(IEnumerator routine) =>
            MonoManager.current != null ? MonoManager.current.StartCoroutine(routine) : null;

        ///<summary>Nodes can use coroutine as normal through MonoManager.</summary>
        public void StopCoroutine(Coroutine routine)
        {
            if (MonoManager.current != null) MonoManager.current.StopCoroutine(routine);
        }

        ///<summary>Returns all *direct* parent nodes (first depth level)</summary>
        public IEnumerable<Node> GetParentNodes()
        {
            if (inConnections.Count != 0) return inConnections.Select(c => c.sourceNode);
            return new Node[0];
        }

        ///<summary>Returns all *direct* children nodes (first depth level)</summary>
        public IEnumerable<Node> GetChildNodes()
        {
            if (outConnections.Count != 0) return outConnections.Select(c => c.targetNode);
            return new Node[0];
        }

        ///<summary>Is node child of parent node?</summary>
        public bool IsChildOf(Node parentNode)
        {
            return inConnections.Any(c => c.sourceNode == parentNode);
        }

        ///<summary>Is node parent of child node?</summary>
        public bool IsParentOf(Node childNode)
        {
            return outConnections.Any(c => c.targetNode == childNode);
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Returns a warning string or null if none</summary>
        protected virtual string GetWarningOrError()
        {
            var hardError = GetHardError();
            if (hardError != null) return "* " + hardError;
            string result = null;
            var assignable = this as ITaskAssignable;
            if (assignable != null && assignable.task != null) result = assignable.task.GetWarningOrError();
            return result;
        }

        ///<summary>A hard error, missing things</summary>
        private string GetHardError()
        {
            if (this is IMissingRecoverable)
                return string.Format("Missing Node '{0}'", (this as IMissingRecoverable).missingType);

            if (this is IReflectedWrapper) {
                var info = (this as IReflectedWrapper).GetSerializedInfo();
                if (info != null && info.AsMemberInfo() == null)
                    return string.Format("Missing Reflected Info '{0}'", info.AsString());
            }
            return null;
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Override to define node functionality. The Agent and Blackboard used to start the Graph are propagated</summary>
        protected virtual Status OnExecute(Component agent, IBlackboard blackboard) => status;

        /// <summary>
        ///     Called when the node gets reseted. e.g. OnGraphStart, after a tree traversal, when interrupted, OnGraphEnd
        ///     etc...
        /// </summary>
        protected virtual void OnReset() { }

        ///<summary>Called once the first time node is created.</summary>
        public virtual void OnCreate(Graph assignedGraph) { }

        ///<summary>Called when the Node is created, duplicated or otherwise needs validation.</summary>
        public virtual void OnValidate(Graph assignedGraph) { }

        ///<summary>Called when the Node is removed from the graph (always through graph.RemoveNode)</summary>
        public virtual void OnDestroy() { }

        ///<summary>Called when an input connection is connected</summary>
        public virtual void OnParentConnected(int connectionIndex) { }

        ///<summary>Called when an input connection is disconnected but before it actually does</summary>
        public virtual void OnParentDisconnected(int connectionIndex) { }

        ///<summary>Called when an output connection is connected</summary>
        public virtual void OnChildConnected(int connectionIndex) { }

        ///<summary>Called when an output connection is disconnected but before it actually does</summary>
        public virtual void OnChildDisconnected(int connectionIndex) { }

        ///<summary>Called when child connection are sorted</summary>
        public virtual void OnChildrenConnectionsSorted(int[] oldIndeces) { }

        ///<summary>Called when the parent graph is started. Use to init values or otherwise.</summary>
        public virtual void OnGraphStarted() { }

        ///<summary>Called when the parent graph is started, but after all OnGraphStarted calls on all nodes.</summary>
        public virtual void OnPostGraphStarted() { }

        ///<summary>Called when the parent graph is stopped.</summary>
        public virtual void OnGraphStoped() { }

        ///<summary>Called when the parent graph is stopped, but after all OnGraphStoped calls on all nodes.</summary>
        public virtual void OnPostGraphStoped() { }

        ///<summary>Called when the parent graph is paused.</summary>
        public virtual void OnGraphPaused() { }

        ///<summary>Called when the parent graph is unpaused.</summary>
        public virtual void OnGraphUnpaused() { }

        ///----------------------------------------------------------------------------------------------

        //...
        public override string ToString()
        {
            var result = name;

            if (this is IReflectedWrapper) {
                var info = (this as IReflectedWrapper).GetSerializedInfo()?.AsMemberInfo();
                if (info != null) result = info.FriendlyName();
            }

            if (this is IGraphAssignable) {
                var subGraph = (this as IGraphAssignable).subGraph;
                if (subGraph != null) result = subGraph.name;
            }
            return string.Format("{0}{1}", result, !string.IsNullOrEmpty(tag) ? " (" + tag + ")" : "");
        }
    }
}
