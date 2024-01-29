export const DbFunction = {
    /* istanbul ignore next */
    lastInsertedId: function () {
        throw new Error("Unsupported operation");
    },
    coalesce: function (...items) {
        return items.first((o) => o !== undefined && o !== null);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJGdW5jdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EYkZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN0QiwwQkFBMEI7SUFDMUIsY0FBYyxFQUFFO1FBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFDRCxRQUFRLEVBQUUsVUFBYSxHQUFHLEtBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0osQ0FBQyJ9