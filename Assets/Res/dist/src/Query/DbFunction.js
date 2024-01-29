export const DbFunction = {
    /* istanbul ignore next */
    lastInsertedId: function () {
        throw new Error("Unsupported operation");
    },
    coalesce: function (...items) {
        return items.first((o) => o !== undefined && o !== null);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJGdW5jdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RiRnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHO0lBQ3RCLDBCQUEwQjtJQUMxQixjQUFjLEVBQUU7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELFFBQVEsRUFBRSxVQUFhLEdBQUcsS0FBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDSixDQUFDIn0=