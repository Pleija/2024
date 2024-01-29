import "reflect-metadata";
import { AbstractEntityMetaData } from "../../MetaData/AbstractEntityMetaData";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { columnMetaKey, entityMetaKey } from "../DecoratorKey";
export function PrimaryKey() {
    return (target, propertyKey /* | symbol */) => {
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        if (!entityMetaData) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
            Reflect.defineMetadata(entityMetaKey, entityMetaData, target.constructor);
        }
        if (!entityMetaData.primaryKeys.any((o) => o.propertyName === propertyKey)) {
            let columnMeta = Reflect.getOwnMetadata(columnMetaKey, target.constructor, propertyKey);
            if (!columnMeta) {
                columnMeta = new ColumnMetaData();
                columnMeta.propertyName = propertyKey;
            }
            entityMetaData.primaryKeys.push(columnMeta);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpbWFyeUtleS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vUHJpbWFyeUtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUcvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9ELE1BQU0sVUFBVSxVQUFVO0lBQ3RCLE9BQU8sQ0FBSyxNQUFVLEVBQUUsV0FBcUIsQ0FBQyxjQUFjLEVBQUUsRUFBRTtRQUM1RCxJQUFJLGNBQWMsR0FBd0IsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixjQUFjLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsV0FBOEIsQ0FBQyxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3pFLElBQUksVUFBVSxHQUF3QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzdHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDZCxVQUFVLEdBQUcsSUFBSSxjQUFjLEVBQVcsQ0FBQztnQkFDM0MsVUFBVSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDMUMsQ0FBQztZQUNELGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDIn0=