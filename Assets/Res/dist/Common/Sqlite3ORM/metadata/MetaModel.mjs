/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetaProperty } from './MetaProperty.mjs';
import { schema } from './Schema.mjs';
import { FKDefinition } from './FKDefinition.mjs';
import { IDXDefinition } from './IDXDefinition.mjs';
export class MetaModel {
    get table() {
        /* istanbul ignore else */
        if (this._table) {
            return this._table;
        }
        /* istanbul ignore next */
        throw new Error(`meta model '${this.name}' not fully initialized yet`);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YU1vZGVsLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YU1vZGVsLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7QUFFdkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR2xELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQTZCcEQsTUFBTSxPQUFPLFNBQVM7SUFLcEIsSUFBSSxLQUFLO1FBQ1AsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQixDQUFDO1FBQ0QsMEJBQTBCO1FBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFNRCxZQUE0QixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQ25ELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsV0FBVyxDQUFDLEdBQVk7UUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsV0FBVyxDQUFDLEdBQVk7UUFDdEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsUUFBUSxFQUFFLGlDQUFpQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBWTtRQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQVksRUFBRSxVQUFtQixFQUFFLElBQWU7UUFDakUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1FBQzdELENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxLQUFLLENBQ2IsYUFBYSxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FDbEYsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELHFCQUFxQixDQUNuQixHQUFZLEVBQ1osY0FBc0IsRUFDdEIsZ0JBQXdCLEVBQ3hCLGlCQUF5QjtRQUV6QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQW1ELENBQUM7UUFDNUUsQ0FBQztRQUNELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDcEIsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1lBQzlELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQ2IsYUFDRSxJQUFJLENBQUMsSUFDUCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsb0NBQW9DLGNBQWMsR0FBRyxDQUN4RSxDQUFDO1FBQ0osQ0FBQztRQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRUQsbUJBQW1CLENBQUMsR0FBWSxFQUFFLFNBQWlCLEVBQUUsUUFBa0IsRUFBRSxJQUFjO1FBQ3JGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBOEMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNyQixlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDYixhQUFhLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSw4QkFBOEIsU0FBUyxHQUFHLENBQ25GLENBQUM7UUFDSixDQUFDO1FBQ0QsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxJQUFJLENBQUMsU0FBb0I7UUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLHdCQUF3QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztRQUM5QyxJQUFJLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksMkJBQTJCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztRQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUUvQyx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFDN0QsQ0FBQztRQUVELGlFQUFpRTtRQUNqRSxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDcEMsb0VBQW9FO1lBQ3BFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyx3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNmLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ2xFLG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0RSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkUsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDOUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNaLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDL0IsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLHVDQUF1Qzt3QkFDdkMsSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDOzRCQUN0QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksU0FBUyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dDQUM3RSxNQUFNLElBQUksS0FBSyxDQUNiLGFBQ0UsSUFBSSxDQUFDLElBQ1AsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSx5Q0FBeUMsQ0FDakUsQ0FBQzs0QkFDSixDQUFDOzRCQUNELE1BQU0sQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQzt3QkFDekMsQ0FBQztvQkFDSCxDQUFDO29CQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDeEUsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVELElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2xCLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLEVBQUU7b0JBQ25ELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3ZDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDWCxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUN0RSxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDcEMsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLDZDQUE2Qzt3QkFDN0MsSUFBSSxVQUFVLENBQUMsZ0JBQWdCLEtBQUssS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7NEJBQzNELE1BQU0sSUFBSSxLQUFLLENBQ2IsYUFDRSxJQUFJLENBQUMsSUFDUCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLCtDQUNyQixVQUFVLENBQUMsZ0JBQ2IsV0FBVyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsQ0FDckMsQ0FBQzt3QkFDSixDQUFDO29CQUNILENBQUM7b0JBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ2hCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7d0JBQ3JCLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxpQkFBaUI7cUJBQ2hELENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxVQUFrQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1lBQzNELElBQUksQ0FBQyxnQkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUNuRSxDQUFDO0lBQ0gsQ0FBQztDQUNGIn0=