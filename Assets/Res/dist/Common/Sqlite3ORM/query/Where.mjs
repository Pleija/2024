export function getPropertyPredicates(modelPredicates, key) {
    return (modelPredicates[key] == undefined
        ? { eq: undefined }
        : modelPredicates[key]);
}
export function getPropertyComparison(propertyPredicate, key) {
    return propertyPredicate[key];
}
export function isModelPredicates(cond) {
    return cond &&
        cond.not === undefined &&
        cond.or === undefined &&
        cond.and === undefined &&
        cond.sql === undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hlcmUubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9XaGVyZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMEVBLE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsZUFBb0MsRUFDcEMsR0FBTTtJQUVOLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUztRQUN2QyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFO1FBQ25CLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQThCLENBQUM7QUFDekQsQ0FBQztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsaUJBQTRDLEVBQzVDLEdBQVc7SUFFWCxPQUFRLGlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUErQkQsTUFBTSxVQUFVLGlCQUFpQixDQUFLLElBQW9CO0lBQ3hELE9BQU8sSUFBSTtRQUNOLElBQVksQ0FBQyxHQUFHLEtBQUssU0FBUztRQUM5QixJQUFZLENBQUMsRUFBRSxLQUFLLFNBQVM7UUFDN0IsSUFBWSxDQUFDLEdBQUcsS0FBSyxTQUFTO1FBQzlCLElBQVksQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDO0FBQ3RDLENBQUMifQ==