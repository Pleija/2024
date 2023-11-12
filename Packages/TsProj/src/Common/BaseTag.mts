import { StateFsm } from "Common/StateFsm.mjs";

export class BaseTag {
    constructor() {

    }

    get enable(): boolean {
        return true;
    }

    set enable(v: boolean) {

    }

    get value(): BaseTag | StateFsm {
        return null;
    }

    set value(v: BaseTag | StateFsm) {

    }
}

export const $ = global.$ = function (...args: any[]) {

}

// export const self:BaseTag = global.BaseTag ??= new BaseTag();