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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmFtaW5nU3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeS9OYW1pbmdTdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7R0FFRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBQTNCO1FBQ1csZ0JBQVcsR0FBb0MsRUFBRSxDQUFDO1FBQ2xELGlCQUFZLEdBQVksSUFBSSxDQUFDO0lBSXhDLENBQUM7SUFIVSxRQUFRLENBQUMsSUFBZTtRQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzFDLENBQUM7Q0FDSiJ9