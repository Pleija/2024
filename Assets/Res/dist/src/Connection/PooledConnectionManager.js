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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbGVkQ29ubmVjdGlvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Db25uZWN0aW9uL1Bvb2xlZENvbm5lY3Rpb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFJcEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLHVCQUFnRCxTQUFRLElBQXNCO0lBQ3ZGLFlBQTRCLE1BQWtCLEVBQWtCLGFBQTBCLEVBQUU7UUFDeEYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRE0sV0FBTSxHQUFOLE1BQU0sQ0FBWTtRQUFrQixlQUFVLEdBQVYsVUFBVSxDQUFrQjtJQUU1RixDQUFDO0lBQ00sS0FBSyxDQUFDLE1BQU07UUFDZixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDTSxLQUFLLENBQUMsaUJBQWlCO1FBQzFCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxhQUFhLENBQUMsUUFBa0I7UUFDbkMsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKIn0=