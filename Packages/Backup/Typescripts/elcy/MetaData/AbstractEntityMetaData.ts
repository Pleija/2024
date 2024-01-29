import { ClassBase } from "../Common/Constant";
import { ColumnGeneration } from "../Common/Enum";
import { GenericType, IObjectType } from "../Common/Type";
import { entityMetaKey } from "../Decorator/DecoratorKey";
import { isNull } from "../Helper/Util";
import { IOrderQueryDefinition } from "../Queryable/Interface/IOrderQueryDefinition";
import { BooleanColumnMetaData } from "./BooleanColumnMetaData";
import { DateTimeColumnMetaData } from "./DateTimeColumnMetaData";
import { EntityMetaData } from "./EntityMetaData";
import { IndexMetaData } from "./IndexMetaData";
import { IColumnMetaData } from "./Interface/IColumnMetaData";
import { IConstraintMetaData } from "./Interface/IConstraintMetaData";
import { IEntityMetaData } from "./Interface/IEntityMetaData";
import { IRelationMetaData } from "./Interface/IRelationMetaData";
import { InheritanceMetaData } from "./Relation/InheritanceMetaData";

export class AbstractEntityMetaData<TE extends TBase, TBase = any> implements IEntityMetaData<TE, TBase> {
    public get insertGeneratedColumns() {
        return this.columns.where((o) => {
            return isNull(o.defaultExp) || (o.generation & ColumnGeneration.Insert) as any;
        }).toArray();
    }
    public get updateGeneratedColumns() {
        return this.columns.where((o) => {
            return (o.generation & ColumnGeneration.Update) as any;
        }).toArray();
    }

    constructor(public type: IObjectType<TE>, name?: string) {
        this.inheritance = new InheritanceMetaData();
        if (typeof name !== "undefined") {
            this.name = name;
        }
        if (!name) {
            this.name = type.name;
        }

        const parentType = Reflect.getPrototypeOf(this.type) as GenericType<TBase>;
        if (parentType !== ClassBase) {
            const parentMetaData: IEntityMetaData<any> = Reflect.getOwnMetadata(entityMetaKey, parentType);
            if (parentMetaData instanceof EntityMetaData && parentMetaData.allowInheritance) {
                this.parentType = parentType;
            }
        }
    }
    public allowInheritance = false;
    public columns: Array<IColumnMetaData<TE>> = [];
    public constraints: Array<IConstraintMetaData<TE>> = [];
    public createDateColumn?: DateTimeColumnMetaData<TE>;
    public defaultOrders?: Array<IOrderQueryDefinition<TE>>;
    public deletedColumn?: BooleanColumnMetaData<TE>;
    public indices: Array<IndexMetaData<TE>> = [];
    public inheritance: InheritanceMetaData<TBase>;
    public modifiedDateColumn?: DateTimeColumnMetaData<TE>;
    public name: string;

    // inheritance
    public parentType?: GenericType<TBase>;
    public primaryKeys: Array<IColumnMetaData<TE>> = [];
    public relations: Array<IRelationMetaData<TE, any>> = [];
}
