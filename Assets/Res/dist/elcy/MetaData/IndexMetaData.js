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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5kZXhNZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9JbmRleE1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE1BQU0sT0FBTyxhQUFhO0lBQ3RCLFlBQW1CLE1BQTJCLEVBQVMsSUFBWSxFQUFFLEdBQUcsT0FBbUM7UUFBeEYsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBRzVELFlBQU8sR0FBK0IsRUFBRSxDQUFDO1FBQ3pDLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFIbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUdEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFdBQTJCO1FBQ3BDLElBQUksT0FBTyxXQUFXLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFdBQVcsQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxJQUFJLE9BQU8sV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDckMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9