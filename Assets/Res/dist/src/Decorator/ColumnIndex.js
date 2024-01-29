import "reflect-metadata";
import { FunctionHelper } from "../Helper/FunctionHelper";
import { AbstractEntityMetaData } from "../MetaData/AbstractEntityMetaData";
import { ComputedColumnMetaData } from "../MetaData/ComputedColumnMetaData";
import { IndexMetaData } from "../MetaData/IndexMetaData";
import { columnMetaKey, entityMetaKey } from "./DecoratorKey";
export function ColumnIndex(optionOrNameOrColumns, uniqueOrColumns, unique) {
    let option = {};
    if (typeof optionOrNameOrColumns === "object" && !Array.isArray(optionOrNameOrColumns)) {
        option = optionOrNameOrColumns;
    }
    else {
        option.name = typeof optionOrNameOrColumns === "string" ? optionOrNameOrColumns : "";
        option.unique = typeof uniqueOrColumns === "boolean" ? uniqueOrColumns : unique || false;
        option.properties = (Array.isArray(optionOrNameOrColumns) ? optionOrNameOrColumns : uniqueOrColumns && Array.isArray(uniqueOrColumns) ? uniqueOrColumns : []);
    }
    return (target, propertyKey) => {
        if (propertyKey) {
            option.properties = [propertyKey];
        }
        else {
            option.properties = option.properties
                .select((o) => typeof o === "string" ? o : FunctionHelper.propertyName(o))
                .toArray();
        }
        if (!option.name) {
            option.name = "IX_" + (unique ? "UQ_" : "") + (option.properties ? option.properties.join("_") : target.name);
        }
        const entConstructor = propertyKey ? target.constructor : target;
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, entConstructor);
        if (entityMetaData == null) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
        }
        let indexMetaData = entityMetaData.indices.first((o) => o.name === option.name);
        if (indexMetaData) {
            entityMetaData.indices.delete(indexMetaData);
        }
        indexMetaData = new IndexMetaData(entityMetaData, option.name);
        entityMetaData.indices.push(indexMetaData);
        indexMetaData.apply(option);
        if (option.properties) {
            indexMetaData.columns = option.properties
                .select((o) => Reflect.getOwnMetadata(columnMetaKey, entityMetaData.type, o))
                .toArray();
            const computedCol = indexMetaData.columns.first((o) => o instanceof ComputedColumnMetaData && !o.columnName);
            if (computedCol) {
                throw new Error(`"${computedCol.propertyName}" cannot be indexed because it's a computed properties`);
            }
        }
        if (!indexMetaData.columns.any()) {
            throw new Error(`"${indexMetaData.name}" must have at least 1 properties to index`);
        }
        Reflect.defineMetadata(entityMetaKey, entityMetaData, entConstructor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uSW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvQ29sdW1uSW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDNUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDNUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFPOUQsTUFBTSxVQUFVLFdBQVcsQ0FBSyxxQkFBOEUsRUFBRSxlQUF1RCxFQUFFLE1BQWdCO0lBQ3JMLElBQUksTUFBTSxHQUFxQixFQUFFLENBQUM7SUFDbEMsSUFBSSxPQUFPLHFCQUFxQixLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDO1FBQ3JGLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQztJQUNuQyxDQUFDO1NBQ0ksQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxxQkFBcUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckYsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLGVBQWUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQztRQUN6RixNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxx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