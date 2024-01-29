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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yS2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0RlY29yYXRvcktleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkQsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM3RCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM5RSxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNuRixNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM5RSxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUVuRix5QkFBeUI7QUFDekIscUJBQXFCO0FBQ3JCLDRCQUE0QjtBQUM1Qiw2QkFBNkI7QUFDN0IsbUJBQW1CO0FBQ25CLDJCQUEyQjtBQUMzQixRQUFRO0FBQ1IsU0FBUztBQUNULDJCQUEyQjtBQUMzQixjQUFjO0FBQ2QsaUJBQWlCO0FBRWpCLGdCQUFnQjtBQUNoQixvQkFBb0I7QUFDcEIscUJBQXFCO0FBQ3JCLG9CQUFvQjtBQUVwQixjQUFjO0FBQ2QsaUNBQWlDO0FBQ2pDLG9GQUFvRjtBQUNwRiwwSkFBMEo7QUFFMUosZUFBZTtBQUNmLGFBQWE7QUFDYixpREFBaUQ7QUFDakQsa0RBQWtEO0FBQ2xELGlEQUFpRDtBQUVqRCxXQUFXO0FBQ1gsdUlBQXVJO0FBRXZJLGFBQWE7QUFDYiw4QkFBOEI7QUFDOUIsc0RBQXNEO0FBQ3RELGtFQUFrRTtBQUNsRSxFQUFFIn0=