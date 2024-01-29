import "reflect-metadata";
import { FunctionHelper } from "../../Helper/FunctionHelper";
import { RelationDataMetaData } from "../../MetaData/Relation/RelationDataMetaData";
import { entityMetaKey } from "../DecoratorKey";
export function RelationshipData(optionsOrSourceType, relationName, targetType, sourceRelationKeys, targetRelationKeys, name, options) {
    let relationOption;
    let sourceName;
    let targetName;
    if (typeof optionsOrSourceType === "object") {
        relationOption = optionsOrSourceType;
        sourceName = relationOption.sourceType.name;
        targetName = relationOption.targetType.name;
    }
    else {
        relationOption = {
            relationName: relationName,
            name,
            sourceRelationKeys: sourceRelationKeys.select((o) => o instanceof Function ? FunctionHelper.propertyName(o) : o).toArray(),
            targetRelationKeys: targetRelationKeys.select((o) => o instanceof Function ? FunctionHelper.propertyName(o) : o).toArray()
        };
        if (typeof optionsOrSourceType !== "string") {
            relationOption.sourceType = optionsOrSourceType;
            sourceName = optionsOrSourceType.name;
        }
        else {
            sourceName = optionsOrSourceType;
        }
        if (typeof targetType !== "string") {
            relationOption.targetType = targetType;
            targetName = targetType.name;
        }
        else {
            targetName = targetType;
        }
        if (options) {
            Object.assign(relationOption, options);
        }
    }
    return (target) => {
        relationOption.type = target;
        if (!relationOption.name) {
            relationOption.name = target.name;
        }
        relationOption.relationName += "_" + sourceName + "_" + targetName;
        const relationDataMeta = new RelationDataMetaData(relationOption);
        const entityMet = Reflect.getOwnMetadata(entityMetaKey, relationOption.type);
        if (entityMet) {
            relationDataMeta.ApplyOption(entityMet);
        }
        const sourceMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.sourceType);
        const sourceRelationMeta = sourceMetaData.relations.first((o) => o.fullName === relationDataMeta.relationName);
        const targetMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.targetType);
        const targetRelationMeta = targetMetaData.relations.first((o) => o.fullName === relationDataMeta.relationName);
        relationDataMeta.completeRelation(sourceRelationMeta, targetRelationMeta);
        Reflect.defineMetadata(entityMetaKey, relationDataMeta, target);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25zaGlwRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9SZWxhdGlvbi9SZWxhdGlvbnNoaXBEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzdELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUtoRCxNQUFNLFVBQVUsZ0JBQWdCLENBQXNCLG1CQUEyRSxFQUFFLFlBQXFCLEVBQUUsVUFBb0MsRUFBRSxrQkFBK0MsRUFBRSxrQkFBK0MsRUFBRSxJQUFhLEVBQUUsT0FBbUM7SUFDaFYsSUFBSSxjQUE0QyxDQUFDO0lBQ2pELElBQUksVUFBa0IsQ0FBQztJQUN2QixJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzFDLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztRQUNyQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDNUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQ2hELENBQUM7U0FDSSxDQUFDO1FBQ0YsY0FBYyxHQUFHO1lBQ2IsWUFBWSxFQUFFLFlBQVk7WUFDMUIsSUFBSTtZQUNKLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO1lBQzFILGtC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