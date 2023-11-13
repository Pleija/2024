import { QueryModelPredicates } from './QueryModelPredicates.mjs';
import { isModelPredicates } from './Where.mjs';
export class QueryCondition {
    op;
    subOperations;
    sql;
    constructor(cond) {
        this.subOperations = [];
        this.sql = '';
        const keys = Object.keys(cond);
        /* istanbul ignore if */
        if (keys.length !== 1) {
            throw new Error(`unknown operation: ${keys.toString()}`);
        }
        const key = keys[0];
        /* istanbul ignore if */
        if (key !== 'not' && key !== 'and' && key !== 'or' && key !== 'sql') {
            throw new Error(`unknown operation: '${key}'`);
        }
        this.op = key;
        if (this.op === 'sql') {
            this.sql = cond[key];
        }
        else if (this.op === 'not') {
            const value = cond[key];
            if (isModelPredicates(value)) {
                this.subOperations.push(new QueryModelPredicates(value));
            }
            else {
                this.subOperations.push(new QueryCondition(value));
            }
        }
        else {
            const value = cond[key];
            value.forEach((item) => {
                if (isModelPredicates(item)) {
                    this.subOperations.push(new QueryModelPredicates(item));
                }
                else {
                    this.subOperations.push(new QueryCondition(item));
                }
            });
        }
    }
    async toSql(metaModel, params, tablePrefix) {
        if (this.op === 'sql') {
            return this.sql;
        }
        const parts = [];
        for (const subOperation of this.subOperations) {
            const part = await subOperation.toSql(metaModel, params, tablePrefix);
            if (part.length) {
                parts.push(part);
            }
        }
        if (!parts.length) {
            return '';
        }
        switch (this.op) {
            case 'not':
                return `not (${parts[0]})`;
            case 'and':
                return '(' + parts.join(') and (') + ')';
            case 'or':
                return '(' + parts.join(') or (') + ')';
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlDb25kaXRpb24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeUNvbmRpdGlvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFbEUsT0FBTyxFQUFhLGlCQUFpQixFQUF3QyxNQUFNLGFBQWEsQ0FBQztBQUVqRyxNQUFNLE9BQU8sY0FBYztJQUNoQixFQUFFLENBQXVCO0lBQ3pCLGFBQWEsQ0FBb0Q7SUFDMUUsR0FBRyxDQUFTO0lBRVosWUFBWSxJQUFtQjtRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0Isd0JBQXdCO1FBQ3hCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUMxRDtRQUNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQix3QkFBd0I7UUFDeEIsSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssS0FBSyxFQUFFO1lBQ25FLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDaEQ7UUFDRCxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNkLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUU7WUFDckIsSUFBSSxDQUFDLEdBQUcsR0FBSSxJQUFZLENBQUMsR0FBRyxDQUFXLENBQUM7U0FDekM7YUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQzVCLE1BQU0sS0FBSyxHQUFJLElBQVksQ0FBQyxHQUFHLENBQXdDLENBQUM7WUFDeEUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzlEO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDeEQ7U0FDRjthQUFNO1lBQ0wsTUFBTSxLQUFLLEdBQUksSUFBWSxDQUFDLEdBQUcsQ0FBNEMsQ0FBQztZQUM1RSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ3JCLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQW9CLENBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDN0Q7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDdkQ7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBb0IsRUFBRSxNQUFjLEVBQUUsV0FBbUI7UUFDbkUsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDakI7UUFDRCxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDM0IsS0FBSyxNQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzdDLE1BQU0sSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsUUFBUSxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ2YsS0FBSyxLQUFLO2dCQUNSLE9BQU8sUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUM3QixLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7WUFDM0MsS0FBSyxJQUFJO2dCQUNQLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztDQUNGIn0=