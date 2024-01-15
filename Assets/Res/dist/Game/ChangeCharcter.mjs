import { StateFsm } from "Common/StateFsm.mjs";
export class ChangeCharacter extends StateFsm {
    init() {
        console.log("init ChangeCharacter test");
    }
}
export const self = global.$ChangeCharacter ??= new ChangeCharacter();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbmdlQ2hhcmN0ZXIubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9HYW1lL0NoYW5nZUNoYXJjdGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFL0MsTUFBTSxPQUFPLGVBQWdCLFNBQVEsUUFBUTtJQUV2QyxJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDTjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUksZUFBZSxFQUFFLENBQUMifQ==