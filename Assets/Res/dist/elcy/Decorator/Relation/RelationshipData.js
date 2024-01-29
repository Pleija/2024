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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25zaGlwRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvUmVsYXRpb24vUmVsYXRpb25zaGlwRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUc3RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNwRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFLaEQsTUFBTSxVQUFVLGdCQUFnQixDQUFzQixtQkFBMkUsRUFBRSxZQUFxQixFQUFFLFVBQW9DLEVBQUUsa0JBQStDLEVBQUUsa0JBQStDLEVBQUUsSUFBYSxFQUFFLE9BQW1DO0lBQ2hWLElBQUksY0FBNEMsQ0FBQztJQUNqRCxJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFBSSxVQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBTyxtQkFBbUIsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUMxQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7UUFDckMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzVDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNoRCxDQUFDO1NBQ0ksQ0FBQztRQUNGLGNBQWMsR0FBRztZQUNiLFlBQVksRUFBRSxZQUFZO1lBQzFCLElBQUk7WUFDSixrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUMxSCxr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