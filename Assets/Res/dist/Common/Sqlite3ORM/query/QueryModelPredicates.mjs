import { QueryPropertyPredicate } from './QueryPropertyPredicate.mjs';
import { getPropertyComparison, getPropertyPredicates } from './Where.mjs';
export class QueryModelPredicates {
    subOperations;
    constructor(pred) {
        this.subOperations = [];
        const keys = Object.keys(pred);
        keys.forEach((propertyKey) => {
            const propertyPredicates = getPropertyPredicates(pred, propertyKey);
            if (typeof propertyPredicates !== 'object' ||
                propertyPredicates instanceof Date ||
                propertyPredicates instanceof Promise) {
                // shorthand form for 'eq' comparison
                this.subOperations.push(new QueryPropertyPredicate(propertyKey, 'eq', propertyPredicates));
            }
            else {
                const comparisonKeys = Object.keys(propertyPredicates);
                comparisonKeys.forEach((comparisonOp) => {
                    const comparison = getPropertyComparison(propertyPredicates, comparisonOp);
                    this.subOperations.push(new QueryPropertyPredicate(propertyKey, comparisonOp, comparison));
                });
            }
        });
    }
    async toSql(metaModel, params, tablePrefix) {
        const parts = [];
        for (const predicate of this.subOperations) {
            const part = await predicate.toSql(metaModel, params, tablePrefix);
            /* istanbul ignore else */
            if (part.length) {
                parts.push(part);
            }
        }
        if (!parts.length) {
            return '';
        }
        return parts.join(' and ');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbFByZWRpY2F0ZXMubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeU1vZGVsUHJlZGljYXRlcy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFtQixNQUFNLGFBQWEsQ0FBQztBQUU1RixNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLGFBQWEsQ0FBeUM7SUFFdEQsWUFBWSxJQUF5QjtRQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUMzQixNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLElBQUksRUFBRSxXQUF1QixDQUFDLENBQUM7WUFFaEYsSUFDRSxPQUFPLGtCQUFrQixLQUFLLFFBQVE7Z0JBQ3RDLGtCQUFrQixZQUFZLElBQUk7Z0JBQ2xDLGtCQUFrQixZQUFZLE9BQU8sRUFDckM7Z0JBQ0EscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQzVGO2lCQUFNO2dCQUNMLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdkQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFO29CQUN0QyxNQUFNLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3JCLElBQUksc0JBQXNCLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FDbEUsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFvQixFQUFFLE1BQWMsRUFBRSxXQUFtQjtRQUNuRSxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDM0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLDBCQUEwQjtZQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNsQjtTQUNGO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0YifQ==