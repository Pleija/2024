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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9RdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saURBQWlELENBQUM7QUFDbEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFeEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDOUYsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUUvRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUs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