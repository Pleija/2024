import { EventHandlerFactory } from "../Event/EventHandlerFactory";
export class PoolResource {
    constructor() {
        [this.releaseEvent, this.onReleased] = EventHandlerFactory(null);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbFJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUG9vbC9Qb29sUmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHbkUsTUFBTSxPQUFnQixZQUFZO0lBQzlCO1FBQ0ksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxtQkFBbUIsQ0FBYSxJQUFJLENBQUMsQ0FBQztJQUNqRixDQUFDO0NBSUoifQ==