import { Pool } from "../Pool/Pool";
import { PooledConnection } from "./PooledConnection";
export class PooledConnectionManager extends Pool {
    constructor(driver, poolOption = {}) {
        super(poolOption);
        this.driver = driver;
        this.poolOption = poolOption;
    }
    async create() {
        const con = await this.driver.getConnection();
        return new PooledConnection(con);
    }
    async getAllConnections() {
        return [await this.create()];
    }
    getConnection(writable) {
        return this.acquireResource();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbGVkQ29ubmVjdGlvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvQ29ubmVjdGlvbi9Qb29sZWRDb25uZWN0aW9uTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBSXBDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyx1QkFBZ0QsU0FBUSxJQUFzQjtJQUN2RixZQUE0QixNQUFrQixFQUFrQixhQUEwQixFQUFFO1FBQ3hGLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQURNLFdBQU0sR0FBTixNQUFNLENBQVk7UUFBa0IsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7SUFFNUYsQ0FBQztJQUNNLEtBQUssQ0FBQyxNQUFNO1FBQ2YsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ00sS0FBSyxDQUFDLGlCQUFpQjtRQUMxQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sYUFBYSxDQUFDLFFBQWtCO1FBQ25DLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2xDLENBQUM7Q0FDSiJ9