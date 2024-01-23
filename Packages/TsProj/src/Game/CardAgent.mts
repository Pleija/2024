import { StateFsm } from "Common/StateFsm.mjs";

export class CardAgent extends StateFsm {

    init() {
        console.log(`init ${this.constructor.name}`);
    }
}

export const self: CardAgent = global.$CardAgent ??= new CardAgent();
