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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RFbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvRW50aXR5L0Fic3RyYWN0RW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUdwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRy9ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQzFHLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFLL0QsTUFBTSxVQUFVLGNBQWMsQ0FBeUMsWUFBd0MsRUFBRSxhQUEwQyxFQUFFLGdCQUEwQjtJQUNuTCxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO0lBQ3BDLElBQUksWUFBWSxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxJQUFJLEVBQUUsQ0FBQztZQUMzQyxNQUFNLENBQUMsZ0JBQWdC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