export class DefaultLogger {
    constructor(excludeSource) {
        this.excludeSource = excludeSource;
    }
    log(source, level, message, error, ...args) {
        if (!this.excludeSource) {
            args.unshift(source);
        }
        if (error) {
            args.unshift(error);
        }
        switch (level) {
            case "error": {
                console.error(message, args);
                break;
            }
            case "warn": {
                console.warn(message, args);
                break;
            }
            case "debug": {
                console.debug(message, args);
                break;
            }
            case "info": {
                console.info(message, args);
                break;
            }
            case "trace": {
                console.trace(message, args);
                break;
            }
            default: {
                console.log(message, args);
                break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmYXVsdExvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0xvZ2dlci9EZWZhdWx0TG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sT0FBTyxhQUFhO0lBQ3RCLFlBQW9CLGFBQXVCO1FBQXZCLGtCQUFhLEdBQWIsYUFBYSxDQUFVO0lBRTNDLENBQUM7SUFDTSxHQUFHLENBQUMsTUFBVyxFQUFFLEtBQWtCLEVBQUUsT0FBZSxFQUFFLEtBQWEsRUFBRSxHQUFHLElBQVc7UUFDdEYsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsUUFBUSxLQUFLLEVBQUUsQ0FBQztZQUNaLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsTUFBTTtZQUNWLENBQUM7WUFDRCxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLE1BQU07WUFDVixDQUFDO1lBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3QixNQUFNO1lBQ1YsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUIsTUFBTTtZQUNWLENBQUM7WUFDRCxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLE1BQU07WUFDVixDQUFDO1lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0IsTUFBTTtZQUNWLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=