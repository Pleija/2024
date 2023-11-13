/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import { MetaModel } from './MetaModel.mjs';
export const METADATA_MODEL_KEY = 'sqlite3orm:model';
/**
 * Get the model metadata
 *
 * @param target - The constructor of the class
 * @returns The meta model
 */
export function getModelMetadata(target) {
    if (!Reflect.hasOwnMetadata(METADATA_MODEL_KEY, target.prototype)) {
        Reflect.defineMetadata(METADATA_MODEL_KEY, new MetaModel(target.name), target.prototype);
    }
    return Reflect.getMetadata(METADATA_MODEL_KEY, target.prototype);
}
/**
 * Helper function for decorating a class and map it to a database table
 *
 * @param target - The constructor of the class
 * @param [opts] - The options for this table
 */
function decorateTableClass(target, opts) {
    const metaModel = getModelMetadata(target);
    metaModel.init(opts);
}
/**
 * Helper function for decorating a property and map it to a table field
 *
 * @param target - The decorated class
 * @param key - The decorated property
 * @param [opts] - The options for this field
 * @param [isIdentity=false] - Indicator if this field belongs to the
 * primary key
 * @returns The field class instance
 */
function decorateFieldProperty(target, key, opts, isIdentity) {
    if (typeof target === 'function') {
        // not decorating static property
        throw new Error(`decorating static property '${key.toString()}' using field-decorator is not supported`);
    }
    const metaModel = getModelMetadata(target.constructor);
    const metaProp = metaModel.getOrAddProperty(key);
    /* istanbul ignore if */
    if (typeof key === 'number') {
        key = key.toString();
    }
    metaProp.setPropertyType(Reflect.getMetadata('design:type', target, key));
    metaModel.setPropertyField(key, isIdentity, opts);
}
/**
 * Helper function for decorating a property and map it to a foreign key field
 *
 * @param target - The decorated class
 * @param key - The decorated property
 * @param constraintName - The name for the foreign key constraint
 * @param foreignTableName - The referenced table name
 * @param foreignTableField - The referenced table field
 * @returns - The field class instance
 */
function decorateForeignKeyProperty(target, key, constraintName, foreignTableName, foreignTableField) {
    if (typeof target === 'function') {
        // not decorating static property
        throw new Error(`decorating static property '${key.toString()}' using fk-decorator is not supported`);
    }
    const metaModel = getModelMetadata(target.constructor);
    metaModel.setPropertyForeignKey(key, constraintName, foreignTableName, foreignTableField);
}
/**
 * Helper function for decorating a property and map it to an index field
 *
 * @param target - The decorated class
 * @param key - The decorated property
 * @param indexName - The name for the index
 * @param [isUnique] - is a unique index
 * @param [desc] - descending order for this column
 * @returns The field class instance
 */
function decorateIndexProperty(target, key, indexName, isUnique, desc) {
    if (typeof target === 'function') {
        // not decorating static property
        throw new Error(`decorating static property '${key.toString()}' using index-decorator is not supported`);
    }
    const metaModel = getModelMetadata(target.constructor);
    metaModel.setPropertyIndexKey(key, indexName, isUnique, desc);
}
/*****************************************************************************************/
/* decorators:

/**
 * The class decorator for mapping a database table to a class
 *
 * @export
 * @param [opts]
 * @returns The decorator function
 */
export function table(opts = {}) {
    return (target) => decorateTableClass(target, opts);
}
/**
 * The property decorator for mapping a table field to a class property
 *
 * @export
 * @param [name] - The name of the field; defaults to the property name
 * @param [dbtype] - The type of the field; defaults to 'TEXT'
 * @returns The decorator function
 */
export function field(opts = {}) {
    return (target, key) => {
        decorateFieldProperty(target, key, opts, false);
    };
}
/**
 * The id decorator for mapping a field of the primary key to a class property
 *
 * @export
 * @param [name] - The name of the field; defaults to the property name
 * @param [dbtype] - The type of the field; defaults to 'TEXT'
 * @returns The decorator function
 */
export function id(opts = {}) {
    return (target, key) => {
        decorateFieldProperty(target, key, opts, true);
    };
}
/**
 * The fk decorator for mapping a class property to be part of a foreign key
 * constraint
 *
 * @export
 * @param constraintName - The constraint name
 * @param foreignTableName - The referenced table name
 * @param foreignTableField - The referenced table field
 * @returns The decorator function
 */
export function fk(constraintName, foreignTableName, foreignTableField) {
    return (target, key) => {
        decorateForeignKeyProperty(target, key, constraintName, foreignTableName, foreignTableField);
    };
}
/**
 * The index decorator for mapping a class property to be part of an index
 *
 * @export
 * @param indexName - The index name
 * @param [isUnique] - index is unique
 * @param [desc] - descending order for this column
 * @returns The decorator function
 */
export function index(indexName, isUnique, desc) {
    return (target, key) => {
        decorateIndexProperty(target, key, indexName, isUnique, desc);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL21ldGFkYXRhL2RlY29yYXRvcnMubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxTQUFTLEVBQVcsTUFBTSxpQkFBaUIsQ0FBQztBQUdyRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztBQThEckQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsTUFBZ0I7SUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ2pFLE9BQU8sQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMxRjtJQUNELE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxNQUFnQixFQUFFLElBQWU7SUFDM0QsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxxQkFBcUIsQ0FDNUIsTUFBeUIsRUFDekIsR0FBWSxFQUNaLElBQWUsRUFDZixVQUFtQjtJQUVuQixJQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtRQUNoQyxpQ0FBaUM7UUFDakMsTUFBTSxJQUFJLEtB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