import "reflect-metadata";
import { ObservableArray } from "../../Common/ObservableArray";
import { RelationMetaData } from "../../MetaData/Relation/RelationMetaData";
import { entityMetaKey, relationChangeDispatherMetaKey, relationMetaKey } from "../DecoratorKey";
export function Relationship(name, typeOrDirection, targetTypeOrType, relationKeysOrTargetType, relationKey, options) {
    const relationOption = {
        name
    };
    let targetName;
    let isMaster = true;
    if (typeOrDirection === "by") {
        // slave relation.
        isMaster = false;
        relationOption.relationType = targetTypeOrType;
        if (typeof relationKeysOrTargetType === "string") {
            targetName = relationKeysOrTargetType;
        }
        else {
            relationOption.targetType = relationKeysOrTargetType;
            targetName = relationOption.targetType.name;
        }
        relationOption.relationKeys = relationKey;
        if (options) {
            Object.assign(relationOption, options);
        }
    }
    else {
        // master relation.
        relationOption.relationType = typeOrDirection;
        if (typeof targetTypeOrType === "string") {
            targetName = targetTypeOrType;
        }
        else {
            relationOption.targetType = targetTypeOrType;
            targetName = relationOption.targetType.name;
        }
        relationOption.relationKeys = relationKeysOrTargetType;
    }
    // TODO: FOR SQL TO-ONE relation target must be a unique or primarykeys
    // TODO: Foreignkey for SQL DB
    return (target, propertyKey) => {
        if (!relationOption.sourceType) {
            relationOption.sourceType = target.constructor;
        }
        relationOption.propertyName = propertyKey;
        const sourceMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.sourceType);
        const relationMeta = new RelationMetaData(relationOption, isMaster);
        relationMeta.isMaster = isMaster;
        Reflect.defineMetadata(relationMetaKey, relationMeta, relationOption.sourceType, propertyKey);
        const relationName = relationOption.relationKeyName ? relationOption.relationKeyName : relationOption.name + "_" + (isMaster ? relationMeta.source.type.name + "_" + targetName : targetName + "_" + relationMeta.source.type.name);
        relationMeta.fullName = relationName;
        sourceMetaData.relations.push(relationMeta);
        if (relationOption.targetType) {
            const targetMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.targetType);
            const reverseRelation = targetMetaData.relations.first((o) => o.fullName === relationName);
            if (reverseRelation) {
                relationMeta.completeRelation(reverseRelation);
            }
        }
        // changes detection here
        const privatePropertySymbol = Symbol(propertyKey);
        let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        let oldGet;
        let oldSet;
        if (descriptor) {
            if (descriptor.get) {
                oldGet = descriptor.get;
            }
            if (descriptor.set) {
                oldSet = descriptor.set;
            }
        }
        descriptor = {
            configurable: true,
            enumerable: true,
            get: function () {
                if (oldGet) {
                    return oldGet.apply(this);
                }
                return this[privatePropertySymbol];
            },
            set: function (value) {
                if (!oldGet && !this.hasOwnProperty(privatePropertySymbol)) {
                    Object.defineProperty(this, privatePropertySymbol, {
                        configurable: true,
                        enumerable: false,
                        value: undefined,
                        writable: true
                    });
                }
                const oldValue = this[propertyKey];
                if (oldValue !== value) {
                    const changeListener = this[relationChangeDispatherMetaKey];
                    if (relationMeta.relationType === "many") {
                        const observed = ObservableArray.observe(value || []);
                        observed.register((type, items) => {
                            if (changeListener) {
                                changeListener({ relation: relationMeta, type, entities: items });
                            }
                        });
                        value = observed;
                    }
                    if (oldSet) {
                        oldSet.apply(this, value);
                    }
                    else {
                        this[privatePropertySymbol] = value;
                    }
                    if (changeListener) {
                        if (relationMeta.relationType === "many") {
                            // NOTE: don't remove current relations,
                            // coz there might be related entity that is not loaded yet.
                            // so removing related entities could not be achived.
                            // To remove current relation, used splice instead
                            if (value && Array.isArray(value) && value.length > 0) {
                                changeListener({ relation: relationMeta, type: "add", entities: value });
                            }
                        }
                        else {
                            // undefined mean current relation is unknown
                            if (oldValue !== null) {
                                changeListener({ relation: relationMeta, type: "del", entities: [oldValue] });
                            }
                            if (value) {
                                changeListener({ relation: relationMeta, type: "add", entities: [value] });
                            }
                        }
                    }
                }
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25zaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL1JlbGF0aW9uL1JlbGF0aW9uc2hpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQU0vRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLDhCQUE4QixFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBS2pHLE1BQU0sVUFBVSxZQUFZLENBQWEsSUFBWSxFQUFFLGVBQWlELEVBQUUsZ0JBQXFFLEVBQUUsd0JBQThFLEVBQUUsV0FBd0MsRUFBRSxPQUFtQztJQUMxVSxNQUFNLGNBQWMsR0FBMEI7UUFDMUMsSUFBSTtLQUNBLENBQUM7SUFDVCxJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLElBQUksZUFBZSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzNCLGtCQUFrQjtRQUNsQixRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGNBQWMsQ0FBQyxZQUFZLEdBQUcsZ0JBQXVCLENBQUM7UUFDdEQsSUFBSSxPQUFPLHdCQUF3QixLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQy9DLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQztRQUMxQyxDQUFDO2FBQ0ksQ0FBQztZQUNGLGNBQWMsQ0FBQyxVQUFVLEdBQUcsd0JBQStCLENBQUM7WUFDNUQsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hELENBQUM7UUFDRCxjQUFjLENBQUMsWUFBWSxHQUFHLFdBQWtCLENBQUM7UUFDakQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0sQ0FB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