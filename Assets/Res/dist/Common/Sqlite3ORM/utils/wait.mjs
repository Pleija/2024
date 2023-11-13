export function wait(cond, timeout = 0, intervall = 100) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        const timer = setInterval(() => {
            if (cond()) {
                clearInterval(timer);
                resolve();
                return;
            }
            if (timeout > 0 && ++counter * intervall >= timeout) {
                clearInterval(timer);
                reject(new Error('timeout reached'));
                return;
            }
        }, intervall);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3V0aWxzL3dhaXQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxJQUFJLENBQ2xCLElBQW1CLEVBQ25CLFVBQWtCLENBQUMsRUFDbkIsWUFBb0IsR0FBRztJQUV2QixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQzdCLElBQUksSUFBSSxFQUFFLEVBQUU7Z0JBQ1YsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPO2FBQ1I7WUFDRCxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sRUFBRTtnQkFDbkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPO2FBQ1I7UUFDSCxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIn0=