export class Defer extends Promise {
    constructor() {
        let _resolve;
        let _reject;
        super((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        this.resolve = _resolve;
        this.reject = _reject;
    }
}
Defer.prototype.constructor = Promise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvQ29tbW9uL0RlZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sT0FBTyxLQUFTLFNBQVEsT0FBVTtJQUNwQztRQUNJLElBQUksUUFBOEMsQ0FBQztRQUNuRCxJQUFJLE9BQStCLENBQUM7UUFDcEMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RCLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDbkIsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO0lBQzFCLENBQUM7Q0FHSjtBQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyJ9