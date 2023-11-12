
import { StateFsm } from "Common/StateFsm.mjs";

export class Modifier extends StateFsm {

}

export const self:Modifier = global.Modifier ??= new Modifier();
