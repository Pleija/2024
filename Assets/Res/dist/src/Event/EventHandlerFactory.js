export const EventHandlerFactory = (source, stopOnFalse = false) => {
    const handlers = [];
    const eventHandler = {
        add: (handler) => {
            handlers.push(handler);
        },
        delete: (handler) => {
            handlers.delete(handler);
        }
    };
    const eventDispacher = function (args) {
        for (const handler of handlers) {
            if (handler(source, args) === false && stopOnFalse) {
                break;
            }
        }
    };
    return [eventHandler, eventDispacher];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRIYW5kbGVyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V2ZW50L0V2ZW50SGFuZGxlckZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBdUIsTUFBZSxFQUFFLFdBQVcsR0FBRyxLQUFLLEVBQTJELEVBQUU7SUFDdkosTUFBTSxRQUFRLEdBQVUsRUFBRSxDQUFDO0lBQzNCLE1BQU0sWUFBWSxHQUFrQztRQUNoRCxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2hCLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsQ0FBQztLQUNKLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBRyxVQUFVLElBQVc7UUFDeEMsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM3QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNqRCxNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUM7SUFFRixPQUFPLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyJ9