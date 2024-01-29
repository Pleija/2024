export class IndexMetaData {
    constructor(entity, name, ...members) {
        this.entity = entity;
        this.name = name;
        this.columns = [];
        this.unique = false;
        this.columns = members;
    }
    /**
     * Apply index option
     */
    apply(indexOption) {
        if (typeof indexOption.name !== "undefined") {
            this.name = indexOption.name;
        }
        if (typeof indexOption.columns !== "undefined") {
            this.columns = indexOption.columns;
        }
        if (typeof indexOption.unique !== "undefined") {
            this.unique = indexOption.unique;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5kZXhNZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL0luZGV4TWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxPQUFPLGFBQWE7SUFDdEIsWUFBbUIsTUFBMkIsRUFBUyxJQUFZLEVBQUUsR0FBRyxPQUFtQztRQUF4RixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFHNUQsWUFBTyxHQUErQixFQUFFLENBQUM7UUFDekMsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUhsQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBR0Q7O09BRUc7SUFDSSxLQUFLLENBQUMsV0FBMkI7UUFDcEMsSUFBSSxPQUFPLFdBQVcsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2pDLENBQUM7UUFDRCxJQUFJLE9BQU8sV0FBVyxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDdkMsQ0FBQztRQUNELElBQUksT0FBTyxXQUFXLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=