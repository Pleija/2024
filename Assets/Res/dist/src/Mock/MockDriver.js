import { MockConnection } from "./MockConnection";
export class MockDriver {
    constructor(option) {
        this.allowPooling = true;
        if (option) {
            this.database = option.database;
            this.allowPooling = option.allowPooling;
            this.dbType = option.dbType;
            this.schema = option.schema;
        }
    }
    async getConnection() {
        return new MockConnection(this.database);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01vY2svTW9ja0RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFTbEQsTUFBTSxPQUFPLFVBQVU7SUFDbkIsWUFBWSxNQUE2QjtRQVFsQyxpQkFBWSxHQUFHLElBQUksQ0FBQztRQVB2QixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBS00sS0FBSyxDQUFDLGFBQWE7UUFDdEIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKIn0=