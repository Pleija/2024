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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZmllcnMubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS91dGlscy9pZGVudGlmaWVycy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFN0Qsb0VBQW9FO0FBRXBFLE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxJQUFZO0lBQ2hELE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUM5QyxDQUFDO0FBRUQsTUFBTSxVQUFVLDZCQUE2QixDQUFDLElBQVk7SUFDeEQsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzlDLENBQUM7QUFFRCxvRUFBb0U7QUFFcEUsTUFBTSxVQUFVLGdCQUFnQixDQUFDLElBQVk7SUFDM0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRCxvRUFBb0U7QUFFcEUsTUFBTSxVQUFVLG1CQUFtQixDQUFDLElBQVk7SUFDOUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBWSxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsSUFBWTtJQUN0RCxPQUFPLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVELG9FQUFvRTtBQUVwRSxNQUFNLFVBQVUsd0JBQXdCLENBQUMsSUFBWSxFQUFFLE1BQWU7SUFDcEUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzVCLHdCQUF3QjtRQUN4QixJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRTtZQUNoRCxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixJQUFJLFNBQVMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUM5RDtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxNQUFNLEdBQUcsTUFBTSxJQUFJLGtCQUFrQixDQUFDO0lBQ3RDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxJQUFZO0lBQ2hELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFcEMsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUMzQixPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0tBQy9FO1NBQU07UUFDTCxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0tBQ3RDO0FBQ0gsQ0FBQyJ9