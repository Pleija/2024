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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlDb25kaXRpb24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeUNvbmRpdGlvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFbEUsT0FBTyxFQUFhLGlCQUFpQixFQUF3QyxNQUFNLGFBQWEsQ0FBQztBQUVqRyxNQUFNLE9BQU8sY0FBYztJQUNoQixFQUFFLENBQXVCO0lBQ3pCLGFBQWEsQ0FBb0Q7SUFDMUUsR0FBRyxDQUFTO0lBRVosWUFBWSxJQUFtQjtRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0Isd0JBQXdCO1FBQ3hCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsd0JBQXdCO1FBQ3hCLElBQUksR0FBRyxLQUFLLEtBQUssSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3BFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ2QsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtB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