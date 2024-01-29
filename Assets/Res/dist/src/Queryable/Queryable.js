import { entityMetaKey } from "../Decorator/DecoratorKey";
import { AndExpression } from "../ExpressionBuilder/Expression/AndExpression";
import { EqualExpression } from "../ExpressionBuilder/Expression/EqualExpression";
import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MemberAccessExpression } from "../ExpressionBuilder/Expression/MemberAccessExpression";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { StrictEqualExpression } from "../ExpressionBuilder/Expression/StrictEqualExpression";
import { isNull, isValue } from "../Helper/Util";
import { AllDeferredQuery } from "../Query/DeferredQuery/AllDeferredQuery";
import { AnyDeferredQuery } from "../Query/DeferredQuery/AnyDeferredQuery";
import { AvgDeferredQuery } from "../Query/DeferredQuery/AvgDeferredQuery";
import { BulkDeleteDeferredQuery } from "../Query/DeferredQuery/BulkDeleteDeferredQuery";
import { BulkUpdateDeferredQuery } from "../Query/DeferredQuery/BulkUpdateDeferredQuery";
import { CountDeferredQuery } from "../Query/DeferredQuery/CountDeferredQuery";
import { FirstDeferredQuery } from "../Query/DeferredQuery/FirstDeferredQuery";
import { InsertIntoDeferredQuery } from "../Query/DeferredQuery/InsertIntoDeferredQuery";
import { MaxDeferredQuery } from "../Query/DeferredQuery/MaxDeferredQuery";
import { MinDeferredQuery } from "../Query/DeferredQuery/MinDeferredQuery";
import { SumDeferredQuery } from "../Query/DeferredQuery/SumDeferredQuery";
import { ToArrayDeferredQuery } from "../Query/DeferredQuery/ToArrayDeferredQuery";
import { ToMapDeferredQuery } from "../Query/DeferredQuery/ToMapDeferredQuery";
export class Queryable {
    get dbContext() {
        return this.parent.dbContext;
    }
    /**
     * parameter that is actually used by current queryable
     */
    get stackTree() {
        if (!this._parameters) {
            this._parameters = this.parent.stackTree;
        }
        return this._parameters;
    }
    get queryOption() {
        return this.parent ? this.parent.queryOption : {};
    }
    constructor(type, parent) {
        this.type = type;
        if (parent) {
            this.parent = parent;
        }
    }
    async all(predicate) {
        const query = this.deferredAll(predicate);
        return await query.execute();
    }
    async any(predicate) {
        const query = this.deferredAny(predicate);
        return await query.execute();
    }
    async avg(selector) {
        const query = this.deferredAvg(selector);
        return await query.execute();
    }
    async contains(item) {
        const query = this.deferredContains(item);
        return await query.execute();
    }
    async count() {
        const query = this.deferredCount();
        return await query.execute();
    }
    deferredAll(predicate) {
        return new AllDeferredQuery(this, predicate);
    }
    deferredAny(predicate) {
        const query = predicate ? this.where(predicate) : this;
        return new AnyDeferredQuery(query);
    }
    deferredAvg(selector) {
        const query = selector ? this.select(selector) : this;
        return new AvgDeferredQuery(query);
    }
    deferredContains(item) {
        const paramExp = new ParameterExpression("o", this.type);
        const itemParamExp = new ParameterExpression("item", item.constructor);
        let bodyExp;
        if (isValue(item)) {
            bodyExp = new StrictEqualExpression(paramExp, itemParamExp);
        }
        else {
            const entityMeta = Reflect.getOwnMetadata(entityMetaKey, this.type);
            if (entityMeta) {
                for (const pk of entityMeta.primaryKeys) {
                    const d = new StrictEqualExpression(new MemberAccessExpression(paramExp, pk.propertyName), new MemberAccessExpression(itemParamExp, pk.propertyName));
                    bodyExp = bodyExp ? new AndExpression(bodyExp, d) : d;
                }
            }
            else {
                // TODO: compare all property for type. not from item
                for (const prop in item) {
                    if (isValue(item[prop]) || isNull(item[prop])) {
                        const d = new StrictEqualExpression(new MemberAccessExpression(paramExp, prop), new MemberAccessExpression(itemParamExp, prop));
                        bodyExp = bodyExp ? new AndExpression(bodyExp, d) : d;
                    }
                }
            }
        }
        const predicate = new FunctionExpression(bodyExp, [paramExp]);
        return this.parameter({ item: item }).where(predicate).deferredAny();
    }
    deferredCount() {
        return new CountDeferredQuery(this);
    }
    deferredFind(id) {
        const isValueType = isValue(id);
        const dbSet = this.dbContext.set(this.type);
        if (!dbSet) {
            throw new Error("Find only support entity queryable");
        }
        const param = new ParameterExpression("o", this.type);
        const paramId = new ParameterExpression("id", id.constructor);
        let andExp;
        if (isValueType) {
            andExp = new EqualExpression(new MemberAccessExpression(param, dbSet.primaryKeys.first().propertyName), paramId);
        }
        else {
            for (const pk of dbSet.primaryKeys) {
                const d = new EqualExpression(new MemberAccessExpression(param, pk.propertyName), new MemberAccessExpression(paramId, pk.propertyName));
                andExp = andExp ? new AndExpression(andExp, d) : d;
            }
        }
        const predicate = new FunctionExpression(andExp, [param]);
        return this.parameter({ id }).where(predicate).deferredFirst();
    }
    deferredFirst(predicate) {
        const query = predicate ? this.where(predicate) : this;
        return new FirstDeferredQuery(query);
    }
    deferredMax(selector) {
        const query = selector ? this.select(selector) : this;
        return new MaxDeferredQuery(query);
    }
    deferredMin(selector) {
        const query = selector ? this.select(selector) : this;
        return new MinDeferredQuery(query);
    }
    deferredSum(selector) {
        const query = selector ? this.select(selector) : this;
        return new SumDeferredQuery(query);
    }
    //#endregion
    //#region deferred
    deferredToArray() {
        return new ToArrayDeferredQuery(this);
    }
    deferredToMap(keySelector, valueSelector) {
        if (!valueSelector) {
            valueSelector = (o) => o;
        }
        return new ToMapDeferredQuery(this, keySelector, valueSelector);
    }
    deferredUpdate(setter) {
        return new BulkUpdateDeferredQuery(this, setter);
    }
    deferredDelete(modeOrPredicate, mode) {
        let predicate = null;
        if (modeOrPredicate) {
            if (modeOrPredicate instanceof Function) {
                predicate = modeOrPredicate;
            }
            else {
                mode = modeOrPredicate;
            }
        }
        const query = predicate ? this.where(predicate) : this;
        return new BulkDeleteDeferredQuery(query, mode);
    }
    deferredInsertInto(type, selector) {
        const query = this.select(selector);
        return new InsertIntoDeferredQuery(query, type);
    }
    async delete(modeOrPredicate, mode) {
        const query = this.deferredDelete(modeOrPredicate, mode);
        return await query.execute();
    }
    async find(id) {
        const query = this.deferredFind(id);
        return await query.execute();
    }
    async first(predicate) {
        const query = this.deferredFirst(predicate);
        return await query.execute();
    }
    async insertInto(type, selector) {
        const query = this.deferredInsertInto(type, selector);
        return await query.execute();
    }
    async max(selector) {
        const query = this.deferredMax(selector);
        return await query.execute();
    }
    async min(selector) {
        const query = this.deferredMin(selector);
        return await query.execute();
    }
    async sum(selector) {
        const query = this.deferredSum(selector);
        return await query.execute();
    }
    async toArray() {
        const query = this.deferredToArray();
        return await query.execute();
    }
    async toMap(keySelector, valueSelector) {
        const query = this.deferredToMap(keySelector, valueSelector);
        return await query.execute();
    }
    toString() {
        const defer = this.deferredToArray();
        this.dbContext.deferredQueries.delete(defer);
        return defer.toString();
    }
    async update(setter) {
        const query = this.deferredUpdate(setter);
        return await query.execute();
    }
}
import "./Queryable.partial";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1F1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUNsRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUV4RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUNoRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUM5RixPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3pGLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRS9FLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBSy9FLE1BQU0sT0FBZ0IsU0FBUztJQUMzQixJQUFXLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNqQyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxJQUFXLFNBQVM7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzdDLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQVcsV0FBVztRQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUNELFlBQW1CLElBQW9CLEVBQUUsTUFBa0I7UUFBeEMsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFDbkMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLENBQUM7SUFDTCxDQUFDO0lBR00sS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUErQjtRQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNNLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBZ0M7UUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQThCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsT0FBTyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBSU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFPO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxLQUFLLENBQUMsS0FBSztRQUNkLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQyxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxXQUFXLENBQUMsU0FBK0I7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ00sV0FBVyxDQUFDLFNBQWdDO1FBQy9DLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sV0FBVyxDQUFDLFFBQThCO1FBQzdDLE1BQU0sS0FBSyxHQUFzQixRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQWdDLENBQUM7UUFDckcsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTSxnQkFBZ0IsQ0FBQyxJQUFPO1FBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxNQUFNLFlBQVksR0FBRyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBa0IsQ0FBQyxDQUFDO1FBQzlFLElBQUksT0FBNkIsQ0FBQztRQUNsQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRSxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQXVCLENBQUM7WUFDMUYsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDYixLQUFLLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ3RKLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLHFEQUFxRDtnQkFDckQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQzVDLE1BQU0sQ0FBQyxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDaEksT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFnQixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEYsQ0FBQztJQUNNLGFBQWE7UUFDaEIsT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDTSxZQUFZLENBQUMsRUFBNkI7UUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFzQixDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQWtCLENBQUMsQ0FBQztRQUNyRSxJQUFJLE1BQTRCLENBQUM7UUFDakMsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNkLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JILENBQUM7YUFDSSxDQUFDO1lBQ0YsS0FBSyxNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksc0JBQXNCLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDeEksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDbkUsQ0FBQztJQUNNLGFBQWEsQ0FBQyxTQUFnQztRQUNqRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN2RCxPQUFPLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNNLFdBQVcsQ0FBQyxRQUE4QjtRQUM3QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQW9DLENBQUM7UUFDdEYsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTSxXQUFXLENBQUMsUUFBOEI7UUFDN0MsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFvQyxDQUFDO1FBQ3RGLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sV0FBVyxDQUFDLFFBQThCO1FBQzdDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBb0MsQ0FBQztRQUN0RixPQUFPLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELFlBQVk7SUFFWixrQkFBa0I7SUFDWCxlQUFlO1FBQ2xCLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ00sYUFBYSxDQUFPLFdBQTJCLEVBQUUsYUFBOEI7UUFDbEYsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pCLGFBQWEsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxPQUFPLElBQUksa0JBQWtCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ00sY0FBYyxDQUFDLE1BQTRCO1FBQzlDLE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUdNLGNBQWMsQ0FBQyxlQUFxRCxFQUFFLElBQWlCO1FBQzFGLElBQUksU0FBUyxHQUF5QixJQUFJLENBQUM7UUFDM0MsSUFBSSxlQUFlLEVBQUUsQ0FBQztZQUNsQixJQUFJLGVBQWUsWUFBWSxRQUFRLEVBQUUsQ0FBQztnQkFDdEMsU0FBUyxHQUFHLGVBQWUsQ0FBQztZQUNoQyxDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsSUFBSSxHQUFHLGVBQWUsQ0FBQztZQUMzQixDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZELE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNNLGtCQUFrQixDQUFLLElBQXFCLEVBQUUsUUFBK0I7UUFDaEYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksdUJBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFHTSxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQXFELEVBQUUsSUFBaUI7UUFDeEYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNNLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBNkI7UUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQWdDO1FBQy9DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUMsT0FBTyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBSyxJQUFxQixFQUFFLFFBQStCO1FBQzlFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsT0FBTyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBQ00sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUE4QjtRQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNNLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBOEI7UUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQThCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsT0FBTyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBQ00sS0FBSyxDQUFDLE9BQU87UUFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNNLEtBQUssQ0FBQyxLQUFLLENBQU8sV0FBMkIsRUFBRSxhQUE4QjtRQUNoRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM3RCxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDTSxRQUFRO1FBQ1gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBQ00sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUE0QjtRQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztDQUVKO0FBRUQsT0FBTyxxQkFBcUIsQ0FBQyJ9