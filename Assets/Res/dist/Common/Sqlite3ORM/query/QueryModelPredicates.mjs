import { QueryPropertyPredicate } from './QueryPropertyPredicate.mjs';
import { getPropertyComparison, getPropertyPredicates } from './Where.mjs';
export class QueryModelPredicates {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbFByZWRpY2F0ZXMubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeU1vZGVsUHJlZGljYXRlcy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFtQixNQUFNLGFBQWEsQ0FBQztBQUU1RixNQUFNLE9BQU8sb0JBQW9CO0lBRy9CLFlBQVksSUFBeUI7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsV0FBdUIsQ0FBQyxDQUFDO1lBRWhGLElBQ0UsT0FBTyxrQkFBa0IsS0FBSyxRQUFRO2dCQUN0QyxrQkFBa0IsWUFBWSxJQUFJO2dCQUNsQyxrQkFBa0IsWUFBWSxPQUFPLEVBQ3JDLENBQUM7Z0JBQ0QscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdGLENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3ZELGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtvQkFDdEMsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzNFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUNyQixJQUFJLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQ2xFLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFvQixFQUFFLE1BQWMsRUFBRSxXQUFtQjtRQUNuRSxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDM0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbkUsMEJBQTBCO1lBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUNGIn0=