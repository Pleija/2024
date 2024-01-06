import { SQL_DEFAULT_SCHEMA } from '../core/SqlDatabase.mjs';
// -----------------------------------------------------------------
export function quoteSimpleIdentifier(name) {
    return '"' + name.replace(/"/g, '""') + '"';
}
export function backtickQuoteSimpleIdentifier(name) {
    return '`' + name.replace(/`/g, '``') + '`';
}
// -----------------------------------------------------------------
export function quoteIdentifiers(name) {
    return name.split('.').map((value) => quoteSimpleIdentifier(value));
}
export function quoteIdentifier(name) {
    return quoteIdentifiers(name).join('.');
}
// -----------------------------------------------------------------
export function unqualifyIdentifier(name) {
    return name.split('.').pop();
}
export function quoteAndUnqualifyIdentifier(name) {
    return quoteSimpleIdentifier(unqualifyIdentifier(name));
}
// -----------------------------------------------------------------
export function qualifiySchemaIdentifier(name, schema) {
    if (name.indexOf('.') !== -1) {
        /* istanbul ignore if */
        if (schema && name.split('.').shift() !== schema) {
            throw new Error(`failed to qualify '${name}' by '${schema}`);
        }
        return name;
    }
    schema = schema || SQL_DEFAULT_SCHEMA;
    return `${schema}.${name}`;
}
export function splitSchemaIdentifier(name) {
    const identifiers = name.split('.');
    if (identifiers.length >= 2) {
        return { identSchema: identifiers.shift(), identName: identifiers.join('.') };
    }
    else {
        return { identName: identifiers[0] };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZmllcnMubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS91dGlscy9pZGVudGlmaWVycy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFN0Qsb0VBQW9FO0FBRXBFLE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxJQUFZO0lBQ2hELE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxDQUFDO0FBRUQsTUFBTSxVQUFVLDZCQUE2QixDQUFDLElBQVk7SUFDeEQsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzlDLENBQUM7QUFFRCxvRUFBb0U7QUFFcEUsTUFBTSxVQUFVLGdCQUFnQixDQUFDLElBQVk7SUFDM0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRCxvRUFBb0U7QUFFcEUsTUFBTSxVQUFVLG1CQUFtQixDQUFDLElBQVk7SUFDOUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBWSxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsSUFBWTtJQUN0RCxPQUFPLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVELG9FQUFvRTtBQUVwRSxNQUFNLFVBQVUsd0JBQXdCLENBQUMsSUFBWSxFQUFFLE1BQWU7SUFDcEUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDN0Isd0JBQXdCO1FBQ3hCLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxTQUFTLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELE1BQU0sR0FBRyxNQUFNLElBQUksa0JBQWtCLENBQUM7SUFDdEMsT0FBTyxHQUFHLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUM3QixDQUFDO0FBRUQsTUFBTSxVQUFVLHFCQUFxQixDQUFDLElBQVk7SUFDaEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVwQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDNUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNoRixDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDdkMsQ0FBQztBQUNILENBQUMifQ==