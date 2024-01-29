var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { AutoInc, Column, PrimaryKey } from "./Sqlite3/Utils/Attributes.mjs";
export class TestData {
    id;
    name;
    age;
    sex;
}
__decorate([
    Column("number"),
    PrimaryKey(),
    AutoInc(),
    __metadata("design:type", Number)
], TestData.prototype, "id", void 0);
__decorate([
    Column("string"),
    __metadata("design:type", String)
], TestData.prototype, "name", void 0);
__decorate([
    Column("number"),
    __metadata("design:type", Number)
], TestData.prototype, "age", void 0);
__decorate([
    Column("number"),
    __metadata("design:type", Number)
], TestData.prototype, "sex", void 0);
// export const self:TestData = global.TestData ??= new TestData();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdERhdGEubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9UZXN0RGF0YS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFN0UsTUFBTSxPQUFPLFFBQVE7SUFHVixFQUFFLENBQVM7SUFHWCxJQUFJLENBQVM7SUFHYixHQUFHLENBQVM7SUFHWixHQUFHLENBQVM7Q0FFdEI7QUFYVTtJQUROLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFBRSxVQUFVLEVBQUU7SUFBRSxPQUFPLEVBQUU7O29DQUN4QjtBQUdYO0lBRE4sTUFBTSxDQUFDLFFBQVEsQ0FBQzs7c0NBQ0c7QUFHYjtJQUROLE1BQU0sQ0FBQyxRQUFRLENBQUM7O3FDQUNFO0FBR1o7SUFETixNQUFNLENBQUMsUUFBUSxDQUFDOztxQ0FDRTtBQUl2QixtRUFBbUUifQ==