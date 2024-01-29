import "reflect-metadata";
import { ClassBase } from "../../Common/Constant";
import { InheritanceType } from "../../Common/Enum";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { toJSON } from "../../Helper/Util";
import { AbstractEntityMetaData } from "../../MetaData/AbstractEntityMetaData";
import { ComputedColumnMetaData } from "../../MetaData/ComputedColumnMetaData";
import { EntityMetaData } from "../../MetaData/EntityMetaData";
import { InheritedColumnMetaData } from "../../MetaData/Relation/InheritedColumnMetaData";
import { InheritedComputedColumnMetaData } from "../../MetaData/Relation/InheritedComputedColumnMetaData";
import { columnMetaKey, entityMetaKey } from "../DecoratorKey";
export function AbstractEntity(optionOrName, defaultOrders, allowInheritance) {
    const option = {};
    if (optionOrName) {
        if (typeof optionOrName === "string") {
            option.name = optionOrName;
            option.defaultOrders = defaultOrders || [];
            option.allowInheritance = allowInheritance;
            if (option.allowInheritance === undefined) {
                option.allowInheritance = true;
            }
        }
    }
    return (type) => {
        if (!option.name) {
            option.name = type.name;
        }
        const entityMetadata = new AbstractEntityMetaData(type, option.name);
        if (defaultOrders) {
            entityMetadata.defaultOrders = defaultOrders.select((o) => ({
                0: ExpressionBuilder.parse(o[0], [type]),
                1: o[1]
            })).toArray();
        }
        const parentType = Object.getPrototypeOf(type);
        if (parentType !== ClassBase) {
            const parentMetaData = Reflect.getOwnMetadata(entityMetaKey, parentType);
            if (parentMetaData) {
                let isInheritance = false;
                if (parentMetaData instanceof AbstractEntityMetaData) {
                    if (parentMetaData.inheritance.parent) {
                        entityMetadata.inheritance.parent = parentMetaData.inheritance.parent;
                        entityMetadata.inheritance.inheritanceType = InheritanceType.SingleTable;
                    }
                    else {
                        entityMetadata.inheritance.parent = parentMetaData;
                        entityMetadata.inheritance.inheritanceType = InheritanceType.None;
                    }
                    isInheritance = true;
                }
                else if (parentMetaData instanceof EntityMetaData && parentMetaData.primaryKeys.length > 0) {
                    entityMetadata.inheritance.parent = parentMetaData;
                    entityMetadata.inheritance.inheritanceType = InheritanceType.SingleTable;
                    isInheritance = true;
                }
                if (isInheritance) {
                    for (const parentColumnMeta of parentMetaData.columns) {
                        const existing = entityMetadata.columns.first((o) => o.propertyName === parentColumnMeta.propertyName);
                        let inheritedColumnMeta;
                        if (parentColumnMeta instanceof ComputedColumnMetaData) {
                            if (!existing) {
                                inheritedColumnMeta = new InheritedComputedColumnMetaData(entityMetadata, parentColumnMeta);
                            }
                        }
                        else {
                            if (existing) {
                                entityMetadata.columns.delete(existing);
                            }
                            inheritedColumnMeta = new InheritedColumnMetaData(entityMetadata, parentColumnMeta);
                        }
                        if (inheritedColumnMeta) {
                            entityMetadata.columns.push(inheritedColumnMeta);
                            Reflect.defineMetadata(columnMetaKey, inheritedColumnMeta, type, parentColumnMeta.propertyName);
                        }
                    }
                    if (entityMetadata.inheritance.inheritanceType !== InheritanceType.None) {
                        const additionProperties = entityMetadata.columns.where((o) => parentMetaData.columns.all((p) => p.propertyName !== o.propertyName)).toArray();
                        for (const columnMeta of additionProperties) {
                            // TODO
                            parentMetaData.columns.push(columnMeta);
                        }
                    }
                    if (parentMetaData.primaryKeys.length > 0) {
                        entityMetadata.primaryKeys = parentMetaData.primaryKeys.select((o) => entityMetadata.columns.first((p) => p.propertyName === o.propertyName)).toArray();
                    }
                    if (parentMetaData.createDateColumn) {
                        entityMetadata.createDateColumn = entityMetadata.columns.first((p) => p.propertyName === parentMetaData.createDateColumn.propertyName);
                    }
                    if (parentMetaData.modifiedDateColumn) {
                        entityMetadata.modifiedDateColumn = entityMetadata.columns.first((p) => p.propertyName === parentMetaData.modifiedDateColumn.propertyName);
                    }
                    if (parentMetaData.deletedColumn) {
                        entityMetadata.deletedColumn = entityMetadata.columns.first((p) => p.propertyName === parentMetaData.deletedColumn.propertyName);
                    }
                    if (parentMetaData.defaultOrders && !entityMetadata.defaultOrders) {
                        entityMetadata.defaultOrders = parentMetaData.defaultOrders;
                    }
                }
            }
        }
        Reflect.defineMetadata(entityMetaKey, entityMetadata, type);
        if (!type.prototype.toJSON) {
            type.prototype.toJSON = toJSON;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RFbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0VudGl0eS9BYnN0cmFjdEVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDOUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUcvRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMxRyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSy9ELE1BQU0sVUFBVSxjQUFjLENBQXlDLFlBQXdDLEVBQUUsYUFBMEMsRUFBRSxnQkFBMEI7SUFDbkwsTUFBTSxNQUFNLEdBQXFCLEVBQUUsQ0FBQztJQUNwQyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztZQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLGFBQWEsSUFBSSxFQUFFLENBQUM7WUFDM0MsTUFBTSxDQUFDLGdCQUFn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