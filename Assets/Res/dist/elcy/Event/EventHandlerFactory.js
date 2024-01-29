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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRIYW5kbGVyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FdmVudC9FdmVudEhhbmRsZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLENBQXVCLE1BQWUsRUFBRSxXQUFXLEdBQUcsS0FBSyxFQUEyRCxFQUFFO0lBQ3ZKLE1BQU0sUUFBUSxHQUFVLEVBQUUsQ0FBQztJQUMzQixNQUFNLFlBQVksR0FBa0M7UUFDaEQsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDYixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNoQixRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUM7S0FDSixDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQUcsVUFBVSxJQUFXO1FBQ3hDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7WUFDN0IsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakQsTUFBTTtZQUNWLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsT0FBTyxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMifQ==