import { BaseTag } from "Common/BaseTag.mjs";
import { StateFsm } from "Common/StateFsm.mjs";

export class Test extends BaseTag {
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

export const self: Test = global.$Test ??= new Test();