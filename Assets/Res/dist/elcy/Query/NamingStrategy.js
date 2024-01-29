/**
 * Naming strategy to be used to name tables and columns in the database.
 */
export class NamingStrategy {
    constructor() {
        this.aliasPrefix = {};
        this.enableEscape = true;
    }
    getAlias(type) {
        return this.aliasPrefix[type] || type;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmFtaW5nU3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnkvTmFtaW5nU3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQUEzQjtRQUNXLGdCQUFXLEdBQW9DLEVBQUUsQ0FBQztRQUNsRCxpQkFBWSxHQUFZLElBQUksQ0FBQztJQUl4QyxDQUFDO0lBSFUsUUFBUSxDQUFDLElBQWU7UUFDM0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==