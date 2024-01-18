import { QueryModelPredicates } from './QueryModelPredicates.mjs';
import { isModelPredicates } from './Where.mjs';
export class QueryCondition {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlDb25kaXRpb24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeUNvbmRpdGlvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFbEUsT0FBTyxFQUFhLGlCQUFpQixFQUF3QyxNQUFNLGFBQWEsQ0FBQztBQUVqRyxNQUFNLE9BQU8sY0FBYztJQUt6QixZQUFZLElBQW1CO1FBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQix3QkFBd0I7UUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQix3QkFBd0I7UUFDeEIsSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDcEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDZCxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsR0FBSSxJQUFZLENBQUMsR0FBRyxDQUFXLENBQUM7UUFDMUMsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUM3QixNQUFNLEtBQUssR0FBSSxJQUFZLENBQUMsR0FBRyxDQUF3QyxDQUFDO1lBQ3hFLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9ELENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sS0FBSyxHQUFJLElBQVksQ0FBQyxHQUFHLENBQTRDLENBQUM7WUFDNUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNyQixJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQW9CLENBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFvQixFQUFFLE1BQWMsRUFBRSxXQUFtQjtRQUNuRSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDM0IsS0FBSyxNQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdEUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkIsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELFFBQVEsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hCLEtBQUssS0FBSztnQkFDUixPQUFPLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDN0IsS0FBSyxLQUFLO2dCQUNSLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQzNDLEtBQUssSUFBSTtnQkFDUCxPQUFPLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztDQUNGIn0=