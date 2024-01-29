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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0VudGl0eS9FbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR3BELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRy9ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQzFHLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFLL0QsTUFBTSxVQUFVLE1BQU0sQ0FBeUMsWUFBd0MsRUFBRSxhQUEwQyxFQUFFLGdCQUEwQjtJQUMzSyxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO0lBQ3BDLElBQUksWUFBWSxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxJQUFJLEVBQUUs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