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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmYXVsdENvbm5lY3Rpb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvQ29ubmVjdGlvbi9EZWZhdWx0Q29ubmVjdGlvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsTUFBTSxPQUFPLHdCQUF3QjtJQUNqQyxZQUE0QixNQUFrQjtRQUFsQixXQUFNLEdBQU4sTUFBTSxDQUFZO0lBQUksQ0FBQztJQUM1QyxLQUFLLENBQUMsaUJBQWlCO1FBQzFCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ00sYUFBYSxDQUFDLFFBQWtCO1FBQ25DLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0NBQ0oifQ==