import "reflect-metadata";
import { EnumColumnMetaData } from "../../MetaData/EnumColumnMetaData";
import { Column } from "./Column";
export function EnumColumn(options, defaultValue) {
    let option = { type: String };
    if (!Array.isArray(options) && options.options) {
        option = options;
    }
    else {
        option.options = options;
        if (defaultValue) {
            option.default = defaultValue;
        }
    }
    let valueOptions = [];
    if (option.options) {
        if (Array.isArray(option.options)) {
            valueOptions = option.options;
            if (option.options.length > 0) {
                if (typeof option.options[0] === "number") {
                    option.type = Number;
                }
            }
            else {
                throw new Error("enum empty");
            }
        }
        else {
            const optionKeys = Object.keys(option.options);
            if (optionKeys.length > 0) {
                valueOptions = optionKeys.map((item) => option.options[item]);
                if (typeof option.options[optionKeys[0]] === "number") {
                    option.type = Number;
                }
            }
            else {
                throw new Error("enum empty");
            }
        }
    }
    option.options = valueOptions;
    return Column(EnumColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vRW51bUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLFVBQVUsQ0FBNEIsT0FBb0QsRUFBRSxZQUFzQjtJQUM5SCxJQUFJLE1BQU0sR0FBeUIsRUFBRSxJQUFJLEVBQUUsTUFBYSxFQUFFLENBQUM7SUFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUssT0FBZ0MsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2RSxNQUFNLEdBQUcsT0FBTyxDQUFDO0lBQ3JCLENBQUM7U0FDSSxDQUFDO1FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUErQixDQUFDO1FBQ2pELElBQUksWUFBWSxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksWUFBWSxHQUFRLEVBQUUsQ0FBQztJQUMzQixJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDaEMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDOUIsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBYSxDQUFDO2dCQUNoQyxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN4QixZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUUsTUFBTSxDQUFDLE9BQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ3BELE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBYSxDQUFDO2dCQUNoQyxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7SUFDOUIsT0FBTyxNQUFNLENBQXVCLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLENBQUMifQ==