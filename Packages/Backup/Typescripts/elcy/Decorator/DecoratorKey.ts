export const columnMetaKey = Symbol("column-meta");
export const entityMetaKey = Symbol("entity-meta");
export const relationMetaKey = Symbol("relation-meta");
export const inheritanceMetaKey = Symbol("inheritance-meta");
export const propertyChangeHandlerMetaKey = Symbol("property-change-handler");
export const propertyChangeDispatherMetaKey = Symbol("property-change-dispatcher");
export const relationChangeHandlerMetaKey = Symbol("relation-change-handler");
export const relationChangeDispatherMetaKey = Symbol("relation-change-dispatcher");

// specific type modifier
// DateTime: timezone
// Decimal: precision, scale
// nvarchar/string: maxlength
// int: incremental
// uuid: generated identity
// index
// unique
// timestamp | ModifiedDate
// CreatedDate
// DeleteProperty

// Closure Table
// TreeChildProperty
// TreeParentProperty
// TreeLevelProperty

// inheritance
// singletable | tableInheritance
// single 2 Entity with same tablename on entityMeta. => act much like embeded type.
// tableInheritane: 2 entity with different table but each one must specify it's primary key as relation could has different name but must have same type.

// relationship
// ForeignKey
// OneToOne  | ScalarNavigation | OneRelationship
// OneToMany | ListNavigation   | ManyRelationship
// ManyToOne | ScalarNavigation | OneRelationship

// Computed
// ComputedProperty. o => o.Orders.count() support custom relationship with select statement. o=>o.Orders.First(), o=>o.ORders.where();

// validation
// Nullable | MaxLength | Enum
// embedded type => split 1 table into 2/more entities
// json type => 1 column of table will be used as an object (JSON)
//
