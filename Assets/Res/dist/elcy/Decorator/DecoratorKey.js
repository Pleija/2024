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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yS2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9EZWNvcmF0b3JLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNuRCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDN0QsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDOUUsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDbkYsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDOUUsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFbkYseUJBQXlCO0FBQ3pCLHFCQUFxQjtBQUNyQiw0QkFBNEI7QUFDNUIsNkJBQTZCO0FBQzdCLG1CQUFtQjtBQUNuQiwyQkFBMkI7QUFDM0IsUUFBUTtBQUNSLFNBQVM7QUFDVCwyQkFBMkI7QUFDM0IsY0FBYztBQUNkLGlCQUFpQjtBQUVqQixnQkFBZ0I7QUFDaEIsb0JBQW9CO0FBQ3BCLHFCQUFxQjtBQUNyQixvQkFBb0I7QUFFcEIsY0FBYztBQUNkLGlDQUFpQztBQUNqQyxvRkFBb0Y7QUFDcEYsMEpBQTBKO0FBRTFKLGVBQWU7QUFDZixhQUFhO0FBQ2IsaURBQWlEO0FBQ2pELGtEQUFrRDtBQUNsRCxpREFBaUQ7QUFFakQsV0FBVztBQUNYLHVJQUF1STtBQUV2SSxhQUFhO0FBQ2IsOEJBQThCO0FBQzlCLHNEQUFzRDtBQUN0RCxrRUFBa0U7QUFDbEUsRUFBRSJ9