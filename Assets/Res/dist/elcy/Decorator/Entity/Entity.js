import "reflect-metadata";
import { ClassBase } from "../../Common/Constant";
import { InheritanceType } from "../../Common/Enum";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { toJSON } from "../../Helper/Util";
import { AbstractEntityMetaData } from "../../MetaData/AbstractEntityMetaData";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { ComputedColumnMetaData } from "../../MetaData/ComputedColumnMetaData";
import { EntityMetaData } from "../../MetaData/EntityMetaData";
import { InheritedColumnMetaData } from "../../MetaData/Relation/InheritedColumnMetaData";
import { InheritedComputedColumnMetaData } from "../../MetaData/Relation/InheritedComputedColumnMetaData";
import { columnMetaKey, entityMetaKey } from "../DecoratorKey";
export function Entity(optionOrName, defaultOrders, allowInheritance) {
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
        const entityMetadata = new EntityMetaData(type, option.name);
        const entityMet = Reflect.getOwnMetadata(entityMetaKey, type);
        if (entityMet) {
            entityMetadata.applyOption(entityMet);
        }
        if (defaultOrders) {
            entityMetadata.defaultOrders = defaultOrders.select((o) => ({
                0: ExpressionBuilder.parse(o[0], [type]),
                1: o[1]
            })).toArray();
        }
        if (!allowInheritance) {
            entityMetadata.descriminatorMember = "";
        }
        const parentType = Object.getPrototypeOf(type);
        if (parentType !== ClassBase) {
            const parentMetaData = Reflect.getOwnMetadata(entityMetaKey, parentType);
            let isInheritance = false;
            if (parentMetaData instanceof AbstractEntityMetaData) {
                if (parentMetaData.inheritance.parent) {
                    entityMetadata.inheritance.parent = parentMetaData.inheritance.parent;
                    entityMetadata.inheritance.inheritanceType = InheritanceType.TablePerClass;
                }
                else {
                    entityMetadata.inheritance.parent = parentMetaData;
                    entityMetadata.inheritance.inheritanceType = InheritanceType.TablePerConcreteClass;
                }
                isInheritance = true;
            }
            else if (parentMetaData instanceof EntityMetaData && parentMetaData.allowInheritance && parentMetaData.primaryKeys.length > 0) {
                entityMetadata.inheritance.parent = parentMetaData;
                entityMetadata.inheritance.inheritanceType = InheritanceType.TablePerClass;
                isInheritance = true;
            }
            if (isInheritance) {
                for (const parentColumnMeta of parentMetaData.columns) {
                    let columnMeta = entityMetadata.columns.first((p) => p.propertyName === parentColumnMeta.propertyName);
                    if (parentColumnMeta instanceof ComputedColumnMetaData) {
                        if (columnMeta) {
                            if (entityMetadata.inheritance.inheritanceType === InheritanceType.TablePerConcreteClass) {
                                columnMeta = new ComputedColumnMetaData();
                                columnMeta.applyOption(parentColumnMeta);
                            }
                            else {
                                columnMeta = new InheritedComputedColumnMetaData(entityMetadata, parentColumnMeta);
                            }
                        }
                    }
                    else {
                        if (entityMetadata.inheritance.inheritanceType === InheritanceType.TablePerConcreteClass) {
                            if (!columnMeta) {
                                columnMeta = new ColumnMetaData(parentColumnMeta.type, entityMetadata);
                                columnMeta.applyOption(parentColumnMeta);
                            }
                        }
                        else {
                            columnMeta = new InheritedColumnMetaData(entityMetadata, parentColumnMeta);
                        }
                    }
                    if (columnMeta) {
                        entityMetadata.columns.push(columnMeta);
                        Reflect.defineMetadata(columnMetaKey, columnMeta, type, parentColumnMeta.propertyName);
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
        Reflect.defineMetadata(entityMetaKey, entityMetadata, type);
        if (!type.prototype.toJSON) {
            type.prototype.toJSON = toJSON;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9FbnRpdHkvRW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUdwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUcvRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMxRyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSy9ELE1BQU0sVUFBVSxNQUFNLENBQXlDLFlBQXdDLEVBQUUsYUFBMEMsRUFBRSxnQkFBMEI7SUFDM0ssTUFBTSxNQUFNLEdBQXFCLEVBQUUsQ0FBQztJQUNwQyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztZQUMzQixNQUFNLENBQUMsYUFBYSxHQUFHLGFBQWEsSUFBSSxFQUFF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