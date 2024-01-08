import { StateFsm } from "Common/StateFsm.mjs";

export class LoadoutState extends StateFsm{

}

export const self:LoadoutState = global.$LoadoutState ??= new LoadoutState();