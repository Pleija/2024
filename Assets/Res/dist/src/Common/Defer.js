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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Db21tb24vRGVmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLEtBQVMsU0FBUSxPQUFVO0lBQ3BDO1FBQ0ksSUFBSSxRQUE4QyxDQUFDO1FBQ25ELElBQUksT0FBK0IsQ0FBQztRQUNwQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEIsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUNuQixPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDMUIsQ0FBQztDQUdKO0FBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDIn0=