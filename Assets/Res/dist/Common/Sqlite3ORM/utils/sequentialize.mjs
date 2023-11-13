export function sequentialize(factories) {
    return factories.reduce((promise, factory) => promise.then((results) => factory().then((result) => results.concat(result))), Promise.resolve([]));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VxdWVudGlhbGl6ZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3V0aWxzL3NlcXVlbnRpYWxpemUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sVUFBVSxhQUFhLENBQUksU0FBOEI7SUFDN0QsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUNyQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUMvRSxPQUFPLENBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQyxDQUN6QixDQUFDO0FBQ0osQ0FBQyJ9