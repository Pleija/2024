import "reflect-metadata";
import { DateColumnMetaData } from "../../MetaData/DateColumnMetaData";
import { Column } from "./Column";
export function DateColumn(optionOrName, dbtype, defaultValue) {
    let option = {};
    if (typeof optionOrName === "string") {
        option.columnName = optionOrName;
        if (defaultValue !== undefined) {
            option.default = defaultValue;
        }
        if (dbtype !== undefined) {
            option.columnType = dbtype;
        }
    }
    else if (optionOrName) {
        option = optionOrName;
    }
    return Column(DateColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0RhdGVDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUV2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxVQUFVLENBQUMsWUFBeUMsRUFBRSxNQUF1QixFQUFFLFlBQXlCO0lBQ3BILElBQUksTUFBTSxHQUFzQixFQUFFLENBQUM7SUFDbkMsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO1FBQ0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUM7U0FDSSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFZLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pELENBQUMifQ==