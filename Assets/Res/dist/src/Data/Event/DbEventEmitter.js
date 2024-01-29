export class DBEventEmitter {
    constructor(...eventListeners) {
        this.eventListeners = eventListeners;
    }
    emitAfterDeleteEvent(param, ...entries) {
        const afterDeletes = [];
        for (const eventl of this.eventListeners) {
            if (eventl.afterDelete) {
                afterDeletes.push(eventl.afterDelete);
            }
        }
        if (afterDeletes.length > 0) {
            for (const entry of entries) {
                for (const handler of afterDeletes) {
                    handler(entry.entity, param);
                }
            }
        }
    }
    emitAfterLoadEvent(...entries) {
        const afterLoads = [];
        for (const eventl of this.eventListeners) {
            if (eventl.afterLoad) {
                afterLoads.push(eventl.afterLoad);
            }
        }
        if (afterLoads.length > 0) {
            for (const entry of entries) {
                for (const handler of afterLoads) {
                    handler(entry.entity);
                }
            }
        }
    }
    emitAfterSaveEvent(param, ...entries) {
        const afterSaves = [];
        for (const eventl of this.eventListeners) {
            if (eventl.afterSave) {
                afterSaves.push(eventl.afterSave);
            }
        }
        if (afterSaves.length > 0) {
            for (const entry of entries) {
                for (const handler of afterSaves) {
                    handler(entry.entity, param);
                }
            }
        }
    }
    emitBeforeDeleteEvent(param, ...entries) {
        const beforeDeletes = [];
        for (const eventl of this.eventListeners) {
            if (eventl.beforeDelete) {
                beforeDeletes.push(eventl.beforeDelete);
            }
        }
        if (beforeDeletes.length > 0) {
            for (const entry of entries) {
                for (const handler of beforeDeletes) {
                    handler(entry.entity, param);
                }
            }
        }
    }
    emitBeforeSaveEvent(param, ...entries) {
        const beforeSaves = [];
        for (const eventl of this.eventListeners) {
            if (eventl.beforeSave) {
                beforeSaves.push(eventl.beforeSave);
            }
        }
        if (beforeSaves.length > 0) {
            for (const entry of entries) {
                for (const handler of beforeSaves) {
                    handler(entry.entity, param);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJFdmVudEVtaXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EYXRhL0V2ZW50L0RiRXZlbnRFbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE1BQU0sT0FBTyxjQUFjO0lBQ3ZCLFlBQVksR0FBRyxjQUEwQztRQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sb0JBQW9CLENBQUMsS0FBd0IsRUFBRSxHQUFHLE9BQThCO1FBQ25GLE1BQU0sWUFBWSxHQUF5RCxFQUFFLENBQUM7UUFDOUUsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3JCLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFCLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzFCLEtBQUssTUFBTSxPQUFPLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ00sa0JBQWtCLENBQUMsR0FBRyxPQUE4QjtRQUN2RCxNQUFNLFVBQVUsR0FBK0IsRUFBRSxDQUFDO1FBQ2xELEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZDLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNuQixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMs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