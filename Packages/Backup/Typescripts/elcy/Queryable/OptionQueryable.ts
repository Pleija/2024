import { clone } from "../Helper/Util";
import { IQueryOption } from "../Query/IQueryOption";
import { IQueryVisitor } from "../Query/IQueryVisitor";
import { Queryable } from "./Queryable";
import { QueryExpression } from "./QueryExpression/QueryExpression";

export class OptionQueryable<T> extends Queryable<T> {
    public get queryOption() {
        return this._queryOption;
    }
    constructor(parent: Queryable<T>, option: IQueryOption) {
        super(parent.type, parent);
        this._queryOption = clone(this.parent.queryOption);
        this.option(option);
    }
    private _queryOption: IQueryOption;
    public buildQuery(queryVisitor: IQueryVisitor): QueryExpression<T[]> {
        return this.parent.buildQuery(queryVisitor);
    }
    public hashCode() {
        return this.parent.hashCode();
    }
    public option(option: IQueryOption) {
        for (const prop in option) {
            const value = (option as any)[prop];
            if (value instanceof Object) {
                if (!(this.queryOption as any)[prop]) {
                    (this.queryOption as any)[prop] = {};
                }
                Object.assign((this.queryOption as any)[prop], value);
            }
            else {
                (this.queryOption as any)[prop] = value;
            }
        }
        return this;
    }
}
