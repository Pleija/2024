export var DateTimeKind;
(function (DateTimeKind) {
    DateTimeKind[DateTimeKind["UTC"] = 0] = "UTC";
    DateTimeKind[DateTimeKind["Unspecified"] = 1] = "Unspecified";
    DateTimeKind[DateTimeKind["Custom"] = 2] = "Custom";
})(DateTimeKind || (DateTimeKind = {}));
export var InheritanceType;
(function (InheritanceType) {
    InheritanceType[InheritanceType["TablePerClass"] = 0] = "TablePerClass";
    InheritanceType[InheritanceType["SingleTable"] = 1] = "SingleTable";
    InheritanceType[InheritanceType["TablePerConcreteClass"] = 2] = "TablePerConcreteClass";
    InheritanceType[InheritanceType["None"] = 3] = "None";
})(InheritanceType || (InheritanceType = {}));
export var EventListenerType;
(function (EventListenerType) {
    /**
     * Run after entity completely loaded from database.
     */
    EventListenerType["AFTER_GET"] = "after-get";
    /**
     * Run before insert or update.
     */
    EventListenerType["BEFORE_SAVE"] = "before-save";
    /**
     * Run after insert or update success.
     */
    EventListenerType["AFTER_SAVE"] = "after-save";
    /**
     * Run before soft delete or hard delete.
     */
    EventListenerType["BEFORE_DELETE"] = "before-delete";
    /**
     * Run after soft delete or hard delete success.
     */
    EventListenerType["AFTER_DELETE"] = "after-delete";
})(EventListenerType || (EventListenerType = {}));
export var QueryType;
(function (QueryType) {
    QueryType[QueryType["Unknown"] = 0] = "Unknown";
    /**
     * Data Query Language
     */
    QueryType[QueryType["DQL"] = 1] = "DQL";
    /**
     * Data Manipulation Language
     */
    QueryType[QueryType["DML"] = 2] = "DML";
    /**
     * Data Definition Language
     */
    QueryType[QueryType["DDL"] = 4] = "DDL";
    /**
     * Data Transaction Language
     */
    QueryType[QueryType["DTL"] = 8] = "DTL";
    /**
     * Data Control Language
     */
    QueryType[QueryType["DCL"] = 16] = "DCL";
})(QueryType || (QueryType = {}));
export var ColumnGeneration;
(function (ColumnGeneration) {
    ColumnGeneration[ColumnGeneration["None"] = 0] = "None";
    ColumnGeneration[ColumnGeneration["Insert"] = 1] = "Insert";
    ColumnGeneration[ColumnGeneration["Update"] = 2] = "Update";
})(ColumnGeneration || (ColumnGeneration = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0NvbW1vbi9FbnVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBTixJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDcEIsNkNBQUcsQ0FBQTtJQUNILDZEQUFXLENBQUE7SUFDWCxtREFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUpXLFlBQVksS0FBWixZQUFZLFFBSXZCO0FBQ0QsTUFBTSxDQUFOLElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN2Qix1RUFBYSxDQUFBO0lBQ2IsbUVBQVcsQ0FBQTtJQUNYLHVGQUFxQixDQUFBO0lBQ3JCLHFEQUFJLENBQUE7QUFDUixDQUFDLEVBTFcsZUFBZSxLQUFmLGVBQWUsUUFLMUI7QUFDRCxNQUFNLENBQU4sSUFBWSxpQkFxQlg7QUFyQkQsV0FBWSxpQkFBaUI7SUFDekI7O09BRUc7SUFDSCw0Q0FBdUIsQ0FBQTtJQUN2Qjs7T0FFRztJQUNILGdEQUEyQixDQUFBO0lBQzNCOztPQUVHO0lBQ0gsOENBQXlCLENBQUE7SUFDekI7O09BRUc7SUFDSCxvREFBK0IsQ0FBQTtJQUMvQjs7T0FFRztJQUNILGtEQUE2QixDQUFBO0FBQ2pDLENBQUMsRUFyQlcsaUJBQWlCLEtBQWpCLGlCQUFpQixRQXFCNUI7QUFFRCxNQUFNLENBQU4sSUFBWSxTQXNCWDtBQXRCRCxXQUFZLFNBQVM7SUFDakIsK0NBQVcsQ0FBQTtJQUNYOztPQUVHO0lBQ0gsdUNBQVksQ0FBQTtJQUNaOztPQUVHO0lBQ0gsdUNBQVksQ0FBQTtJQUNaOztPQUVHO0lBQ0gsdUNBQVksQ0FBQTtJQUNaOztPQUVHO0lBQ0gsdUNBQVksQ0FBQTtJQUNaOztPQUVHO0lBQ0gsd0NBQVksQ0FBQTtBQUNoQixDQUFDLEVBdEJXLFNBQVMsS0FBVCxTQUFTLFFBc0JwQjtBQUVELE1BQU0sQ0FBTixJQUFZLGdCQUlYO0FBSkQsV0FBWSxnQkFBZ0I7SUFDeEIsdURBQVEsQ0FBQTtJQUNSLDJEQUFlLENBQUE7SUFDZiwyREFBZSxDQUFBO0FBQ25CLENBQUMsRUFKVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBSTNCIn0=