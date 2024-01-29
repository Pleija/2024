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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJFdmVudEVtaXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGF0YS9FdmVudC9EYkV2ZW50RW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxNQUFNLE9BQU8sY0FBYztJQUN2QixZQUFZLEdBQUcsY0FBMEM7UUFDckQsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDekMsQ0FBQztJQUVNLG9CQUFvQixDQUFDLEtBQXdCLEVBQUUsR0FBRyxPQUE4QjtRQUNuRixNQUFNLFlBQVksR0FBeUQsRUFBRSxDQUFDO1FBQzlFLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZDLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQixZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMxQixLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixLQUFLLE1BQU0sT0FBTyxJQUFJLFlBQVksRUFBRSxDQUFDO29CQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNNLGtCQUFrQixDQUFDLEdBQUcsT0FBOEI7UUFDdkQsTUFBTSxVQUFVLEdBQStCLEVBQUUsQ0FBQztRQUNsRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFD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