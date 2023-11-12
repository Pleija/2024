import { StateFsm } from "Common/StateFsm.mjs";

export class TutorialState extends StateFsm {

}

export const self: TutorialState = global.TutorialState ??= new TutorialState();

