import {StateFsm} from "Common/StateFsm.mjs";
import GameObject = CS.UnityEngine.GameObject;

export class LoadingCharPos extends StateFsm {

    unityChan: GameObject;

    init() {
        console.log("init LoadingCharPos");
        
    }
}

export const self: LoadingCharPos = global.$LoadingCharPos ??= new LoadingCharPos();
