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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmYXVsdExvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Mb2dnZXIvRGVmYXVsdExvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sYUFBYTtJQUN0QixZQUFvQixhQUF1QjtRQUF2QixrQkFBYSxHQUFiLGFBQWEsQ0FBVTtJQUUzQyxDQUFDO0lBQ00sR0FBRyxDQUFDLE1BQVcsRUFBRSxLQUFrQixFQUFFLE9BQWUsRUFBRSxLQUFhLEVBQUUsR0FBRyxJQUFXO1FBQ3RGLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUNELFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDWixLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLE1BQU07WUFDVixDQUFDO1lBQ0QsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1QixNQUFNO1lBQ1YsQ0FBQztZQUNELEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsTUFBTTtZQUNWLENBQUM7WUFDRCxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLE1BQU07WUFDVixDQUFDO1lBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3QixNQUFNO1lBQ1YsQ0FBQztZQUNELE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLE1BQU07WUFDVixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9