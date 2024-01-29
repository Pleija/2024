import { entityMetaKey } from "../../Decorator/DecoratorKey";
import { hashCode, resolveClone } from "../../Helper/Util";
import { ComputedColumnMetaData } from "../../MetaData/ComputedColumnMetaData";
import { EntityMetaData } from "../../MetaData/EntityMetaData";
import { ColumnExpression } from "./ColumnExpression";
export class EntityExpression {
    get columns() {
        if (!this._columns) {
            if (this.metaData) {
                this._columns = this.metaData.columns
                    .where((o) => !(o instanceof ComputedColumnMetaData))
                    .select((o) => new ColumnExpression(this, o, this.metaData.primaryKeys.contains(o)))
                    .toArray();
            }
            else {
                this._columns = [];
            }
        }
        return this._columns;
    }
    set columns(value) {
        this._columns = value;
    }
    get defaultOrders() {
        if (!this._defaultOrders) {
            if (this.metaData && this.metaData.defaultOrders) {
                this._defaultOrders = this.metaData.defaultOrders.slice();
            }
            else {
                this._defaultOrders = [];
            }
        }
        return this._defaultOrders;
    }
    get deleteColumn() {
        if (typeof this._deleteColumn === "undefined") {
            this._deleteColumn = !this.metaData || !this.metaData.deletedColumn ? null : this.columns.first((o) => o.propertyName === this.metaData.deletedColumn.propertyName);
        }
        return this._deleteColumn;
    }
    get metaData() {
        if (!this._metaData) {
            this._metaData = Reflect.getOwnMetadata(entityMetaKey, this.type);
        }
        return this._metaData;
    }
    get modifiedColumn() {
        if (typeof this._modifiedColumn === "undefined") {
            this._modifiedColumn = !this.metaData || !this.metaData.modifiedDateColumn ? null : this.columns.first((o) => o.propertyName === this.metaData.modifiedDateColumn.propertyName);
        }
        return this._modifiedColumn;
    }
    get primaryColumns() {
        if (!this._primaryColumns) {
            if (this.metaData) {
                this._primaryColumns = this.metaData.primaryKeys.select((o) => this.columns.first((c) => c.columnName === o.columnName)).toArray();
            }
            else {
                this._primaryColumns = [];
            }
        }
        return this._primaryColumns;
    }
    set primaryColumns(value) {
        this._primaryColumns = value;
    }
    get versionColumn() {
        if (typeof this._versionColumn === "undefined") {
            this._versionColumn = !this.metaData || !this.metaData.versionColumn ? null : this.columns.first((o) => o.propertyName === this.metaData.versionColumn.propertyName);
        }
        return this._versionColumn;
    }
    constructor(typeOrMeta, alias, isRelationData) {
        this.alias = alias;
        this.isRelationData = isRelationData;
        if (typeOrMeta instanceof EntityMetaData) {
            this._metaData = typeOrMeta;
            this.type = typeOrMeta.type;
        }
        else {
            this.type = typeOrMeta;
        }
        if (this.metaData) {
            this.name = this.metaData.name;
            this.entityTypes = [this.metaData.type];
        }
        else {
            this.entityTypes = [this.type];
        }
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const clone = new EntityExpression(this.type, this.alias);
        replaceMap.set(this, clone);
        clone.columns = this.columns.select((o) => {
            let cloneCol = clone.columns.first((c) => c.propertyName === o.propertyName);
            if (!cloneCol) {
                cloneCol = resolveClone(o, replaceMap);
            }
            replaceMap.set(o, cloneCol);
            return cloneCol;
        }).toArray();
        clone.name = this.name;
        return clone;
    }
    hashCode() {
        return hashCode(this.name);
    }
    toString() {
        return `Entity(${this.name})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0VudGl0eUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdELE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRS9ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBS3RELE1BQU0sT0FBTyxnQkFBZ0I7SUFDekIsSUFBVyxPQUFPO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU87cUJBQ2hDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxzQkFBc0IsQ0FBQyxDQUFDO3FCQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksZ0JBQWdCLENBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDdEYsT0FBTyxFQUFFLENBQUM7WUFDbkIsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7UUFDTCxDQUFDO1FB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