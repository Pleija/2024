import { clone } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class OptionQueryable extends Queryable {
    get queryOption() {
        return this._queryOption;
    }
    constructor(parent, option) {
        super(parent.type, parent);
        this._queryOption = clone(this.parent.queryOption);
        this.option(option);
    }
    buildQuery(queryVisitor) {
        return this.parent.buildQuery(queryVisitor);
    }
    hashCode() {
        return this.parent.hashCode();
    }
    option(option) {
        for (const prop in option) {
            const value = option[prop];
            if (value instanceof Object) {
                if (!this.queryOption[prop]) {
                    this.queryOption[prop] = {};
                }
                Object.assign(this.queryOption[prop], value);
            }
            else {
                this.queryOption[prop] = value;
            }
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9PcHRpb25RdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3ZDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHeEMsTUFBTSxPQUFPLGVBQW1CLFNBQVEsU0FBWTtJQUNoRCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFDRCxZQUFZLE1BQW9CLEVBQUUsTUFBb0I7UUFDbEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxVQUFVLENBQUMsWUFBMkI7UUFDekMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBQ00sTUFBTSxDQUFDLE1BQW9CO1FBQzlCLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7WUFDeEIsTUFBTSxLQUFLLEdBQUksTUFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksS0FBSyxZQUFZLE1BQU0sRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUUsSUFBSSxDQUFDLFdBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLFdBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN6QyxDQUFDO2dCQUNELE1BQU0sQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFDLFdBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFDSSxDQUFDO2dCQUNELElBQUksQ0FBQyxXQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM1QyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSiJ9