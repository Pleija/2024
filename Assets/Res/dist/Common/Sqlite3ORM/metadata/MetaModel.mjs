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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YU1vZGVsLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YU1vZGVsLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7QUFFdkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR2xELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQTZCcEQsTUFBTSxPQUFPLFNBQVM7SUFrQlE7SUFqQlosVUFBVSxDQUE2QjtJQUN2QyxnQkFBZ0IsQ0FBNEI7SUFFcEQsTUFBTSxDQUFTO0lBQ3ZCLElBQUksS0FBSztRQUNQLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDcEI7UUFDRCwwQkFBMEI7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLDZCQUE2QixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVPLElBQUksQ0FBa0I7SUFFOUIsT0FBTyxDQUFtQixDQUFDLHlDQUF5QztJQUVwRSxZQUE0QixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQ25ELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsV0FBVyxDQUFDLEdBQVk7UUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FB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