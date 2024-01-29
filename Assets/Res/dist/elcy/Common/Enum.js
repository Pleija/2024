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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Db21tb24vRW51bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQU4sSUFBWSxZQUlYO0FBSkQsV0FBWSxZQUFZO0lBQ3BCLDZDQUFHLENBQUE7SUFDSCw2REFBVyxDQUFBO0lBQ1gsbURBQU0sQ0FBQTtBQUNWLENBQUMsRUFKVyxZQUFZLEtBQVosWUFBWSxRQUl2QjtBQUNELE1BQU0sQ0FBTixJQUFZLGVBS1g7QUFMRCxXQUFZLGVBQWU7SUFDdkIsdUVBQWEsQ0FBQTtJQUNiLG1FQUFXLENBQUE7SUFDWCx1RkFBcUIsQ0FBQTtJQUNyQixxREFBSSxDQUFBO0FBQ1IsQ0FBQyxFQUxXLGVBQWUsS0FBZixlQUFlLFFBSzFCO0FBQ0QsTUFBTSxDQUFOLElBQVksaUJBcUJYO0FBckJELFdBQVksaUJBQWlCO0lBQ3pCOztPQUVHO0lBQ0gsNENBQXVCLENBQUE7SUFDdkI7O09BRUc7SUFDSCxnREFBMkIsQ0FBQTtJQUMzQjs7T0FFRztJQUNILDhDQUF5QixDQUFBO0lBQ3pCOztPQUVHO0lBQ0gsb0RBQStCLENBQUE7SUFDL0I7O09BRUc7SUFDSCxrREFBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBckJXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFxQjVCO0FBRUQsTUFBTSxDQUFOLElBQVksU0FzQlg7QUF0QkQsV0FBWSxTQUFTO0lBQ2pCLCtDQUFXLENBQUE7SUFDWDs7T0FFRztJQUNILHVDQUFZLENBQUE7SUFDWjs7T0FFRztJQUNILHVDQUFZLENBQUE7SUFDWjs7T0FFRztJQUNILHVDQUFZLENBQUE7SUFDWjs7T0FFRztJQUNILHVDQUFZLENBQUE7SUFDWjs7T0FFRztJQUNILHdDQUFZLENBQUE7QUFDaEIsQ0FBQyxFQXRCVyxTQUFTLEtBQVQsU0FBUyxRQXNCcEI7QUFFRCxNQUFNLENBQU4sSUFBWSxnQkFJWDtBQUpELFdBQVksZ0JBQWdCO0lBQ3hCLHVEQUFRLENBQUE7SUFDUiwyREFBZSxDQUFBO0lBQ2YsMkRBQWUsQ0FBQTtBQUNuQixDQUFDLEVBSlcsZ0JBQWdCLEtBQWhCLGdCQUFnQixRQUkzQiJ9