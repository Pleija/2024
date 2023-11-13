export function isFilter(whereOrFilter) {
    return whereOrFilter &&
        (whereOrFilter.select !== undefined ||
            whereOrFilter.where !== undefined ||
            whereOrFilter.order !== undefined ||
            whereOrFilter.limit !== undefined ||
            whereOrFilter.offset !== undefined ||
            whereOrFilter.tableAlias !== undefined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vcXVlcnkvRmlsdGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFvQkEsTUFBTSxVQUFVLFFBQVEsQ0FBSyxhQUFzQztJQUMvRCxPQUFPLGFBQWE7UUFDaEIsQ0FBRSxhQUE0QixDQUFDLE1BQU0sS0FBSyxTQUFTO1lBQzlDLGFBQTRCLENBQUMsS0FBSyxLQUFLLFNBQVM7WUFDaEQsYUFBNEIsQ0FBQyxLQUFLLEtBQUssU0FBUztZQUNoRCxhQUE0QixDQUFDLEtBQUssS0FBSyxTQUFTO1lBQ2hELGFBQTRCLENBQUMsTUFBTSxLQUFLLFNBQVM7WUFDakQsYUFBNEIsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDcEUsQ0FBQyJ9