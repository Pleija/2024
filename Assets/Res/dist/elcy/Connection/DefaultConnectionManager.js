export class DefaultConnectionManager {
    constructor(driver) {
        this.driver = driver;
    }
    async getAllConnections() {
        return [await this.driver.getConnection()];
    }
    getConnection(writable) {
        return this.driver.getConnection();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmYXVsdENvbm5lY3Rpb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0Nvbm5lY3Rpb24vRGVmYXVsdENvbm5lY3Rpb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE1BQU0sT0FBTyx3QkFBd0I7SUFDakMsWUFBNEIsTUFBa0I7UUFBbEIsV0FBTSxHQUFOLE1BQU0sQ0FBWTtJQUFJLENBQUM7SUFDNUMsS0FBSyxDQUFDLGlCQUFpQjtRQUMxQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNNLGFBQWEsQ0FBQyxRQUFrQjtRQUNuQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkMsQ0FBQztDQUNKIn0=