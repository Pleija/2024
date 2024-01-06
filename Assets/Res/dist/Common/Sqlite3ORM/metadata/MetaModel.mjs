/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetaProperty } from './MetaProperty.mjs';
import { schema } from './Schema.mjs';
import { FKDefinition } from './FKDefinition.mjs';
import { IDXDefinition } from './IDXDefinition.mjs';
export class MetaModel {
    name;
    properties;
    mapColNameToProp;
    _table;
    get table() {
        /* istanbul ignore else */
        if (this._table) {
            return this._table;
        }
        /* istanbul ignore next */
        throw new Error(`meta model '${this.name}' not fully initialized yet`);
    }
    opts;
    qmCache; // initialized by QueryModel (BaseDAO,..)
    constructor(name) {
        this.name = name;
        this.properties = new Map();
        this.mapColNameToProp = new Map();
        this.opts = {};
    }
    hasProperty(key) {
        return this.properties.get(key);
    }
    getProperty(key) {
        const prop = this.properties.get(key);
        if (prop) {
            return prop;
        }
        throw new Error(`property '${key.toString()}' not defined for meta model '${this.name}'`);
    }
    getOrAddProperty(key) {
        let prop = this.properties.get(key);
        if (!prop) {
            prop = new MetaProperty(this.name, key);
            this.properties.set(key, prop);
        }
        return prop;
    }
    setPropertyField(key, isIdentity, opts) {
        this.getOrAddProperty(key);
        if (!this.opts.field) {
            this.opts.field = new Map();
        }
        let fieldOpts = this.opts.field.get(key);
        if (fieldOpts) {
            throw new Error(`property '${this.name}.${key.toString()}' already mapped to '${fieldOpts.name}'`);
        }
        fieldOpts = { name: opts.name || key.toString(), isIdentity, opts };
        this.opts.field.set(key, fieldOpts);
    }
    setPropertyForeignKey(key, constraintName, foreignTableName, foreignTableField) {
        this.getOrAddProperty(key);
        if (!this.opts.fk) {
            this.opts.fk = new Map();
        }
        let propertyFkOpts = this.opts.fk.get(key);
        if (!propertyFkOpts) {
            propertyFkOpts = new Map();
            this.opts.fk.set(key, propertyFkOpts);
        }
        if (propertyFkOpts.has(constraintName)) {
            throw new Error(`property '${this.name}.${key.toString()}' already mapped to foreign key '${constraintName}'`);
        }
        propertyFkOpts.set(constraintName, { constraintName, foreignTableName, foreignTableField });
    }
    setPropertyIndexKey(key, indexName, isUnique, desc) {
        this.getOrAddProperty(key);
        if (!this.opts.index) {
            this.opts.index = new Map();
        }
        let propertyIdxOpts = this.opts.index.get(key);
        if (!propertyIdxOpts) {
            propertyIdxOpts = new Map();
            this.opts.index.set(key, propertyIdxOpts);
        }
        if (propertyIdxOpts.has(indexName)) {
            throw new Error(`property '${this.name}.${key.toString()}' already mapped to index '${indexName}'`);
        }
        propertyIdxOpts.set(indexName, { name: indexName, isUnique, desc });
    }
    init(tableOpts) {
        if (this._table) {
            throw new Error(`meta model '${this.name}' already mapped to '${this._table.name}'`);
        }
        const tableName = tableOpts.name || this.name;
        try {
            this._table = schema().getOrAddTable(tableName, tableOpts);
        }
        catch (err) {
            throw new Error(`meta model '${this.name}': failed to add table: ${err.message}`);
        }
        const idxDefs = new Map();
        const fkDefs = new Map();
        /* istanbul ignore if */
        if (!this.opts.field) {
            this.opts.field = new Map();
        }
        // after all the decoraters have run and a table has been created
        // we are able to fully initialize all properties:
        this.properties.forEach((prop, key) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let fieldOpts = this.opts.field.get(key);
            /* istanbul ignore if */
            if (!fieldOpts) {
                fieldOpts = { name: key.toString(), isIdentity: false, opts: {} };
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.opts.field.set(key, fieldOpts);
            }
            prop.init(this, fieldOpts.name, fieldOpts.isIdentity, fieldOpts.opts);
            const allPropIdxOpts = this.opts.index && this.opts.index.get(key);
            if (allPropIdxOpts) {
                allPropIdxOpts.forEach((propIdxOpts, idxName) => {
                    let idxDef = idxDefs.get(idxName);
                    if (!idxDef) {
                        idxDef = new IDXDefinition(idxName, propIdxOpts.isUnique);
                        idxDefs.set(idxName, idxDef);
                    }
                    else {
                        // test for conflicting isUniqe setting
                        if (propIdxOpts.isUnique != undefined) {
                            if (idxDef.isUnique != undefined && propIdxOpts.isUnique !== idxDef.isUnique) {
                                throw new Error(`property '${this.name}.${prop.key.toString()}': conflicting index uniqueness setting`);
                            }
                            idxDef.isUnique = propIdxOpts.isUnique;
                        }
                    }
                    idxDef.fields.push({ name: prop.field.name, desc: propIdxOpts.desc });
                });
            }
            const allPropFkOpts = this.opts.fk && this.opts.fk.get(key);
            if (allPropFkOpts) {
                allPropFkOpts.forEach((propFkOpts, constraintName) => {
                    let fkDef = fkDefs.get(constraintName);
                    if (!fkDef) {
                        fkDef = new FKDefinition(constraintName, propFkOpts.foreignTableName);
                        fkDefs.set(constraintName, fkDef);
                    }
                    else {
                        // test for conflicting foreign table setting
                        if (propFkOpts.foreignTableName !== fkDef.foreignTableName) {
                            throw new Error(`property '${this.name}.${prop.key.toString()}': conflicting foreign table setting: new: '${propFkOpts.foreignTableName}', old '${fkDef.foreignTableName}'`);
                        }
                    }
                    fkDef.fields.push({
                        name: prop.field.name,
                        foreignColumnName: propFkOpts.foreignTableField,
                    });
                });
            }
        });
        idxDefs.forEach((idxDef) => {
            this.table.addIDXDefinition(idxDef);
        });
        fkDefs.forEach((fkDef) => {
            this.table.addFKDefinition(fkDef);
        });
        this.table.models.add(this);
        this.opts = {};
    }
    destroy() {
        if (this._table) {
            this._table.models.delete(this);
            if (!this.table.models.size) {
                schema().deleteTable(this._table.name);
            }
            this._table = undefined;
            this.properties = new Map();
            this.mapColNameToProp = new Map();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YU1vZGVsLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YU1vZGVsLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7QUFFdkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR2xELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQTZCcEQsTUFBTSxPQUFPLFNBQVM7SUFrQlE7SUFqQlosVUFBVSxDQUE2QjtJQUN2QyxnQkFBZ0IsQ0FBNEI7SUFFcEQsTUFBTSxDQUFTO0lBQ3ZCLElBQUksS0FBSztRQUNQLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUNELDBCQUEwQjtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksNkJBQTZCLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRU8sSUFBSSxDQUFrQjtJQUU5QixPQUFPLENBQW1CLENBQUMseUNBQXlDO0lBRXBFLFlBQTRCLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7UUFDbkQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1FBQ3hELElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxXQUFXLENBQUMsR0FBWTtRQUN0QixPQUFPLElBQUksQ0FBQyxVQUFVLENB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