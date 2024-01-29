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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uSW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbkluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUcxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBTzlELE1BQU0sVUFBVSxXQUFXLENBQUsscUJBQThFLEVBQUUsZUFBdUQsRUFBRSxNQUFnQjtJQUNyTCxJQUFJLE1BQU0sR0FBcUIsRUFBRSxDQUFDO0lBQ2xDLElBQUksT0FBTyxxQkFBcUIsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztRQUNyRixNQUFNLEdBQUcscUJBQXFCLENBQUM7SUFDbkMsQ0FBQztTQUNJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8scUJBQXFCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JGLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7UUFDekYsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMs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