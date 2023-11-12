import $typeof = puer.$typeof;

global.__dirname = ".";
global.Buffer ??= require("buffer");

global.getAllMethod = function getAllMethod(toCheck: any): string[] {
    const props = [];
    let obj = toCheck;
    do {
        props.push(...Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter((e, i, arr) => {
        if (e != arr[i + 1] && typeof toCheck[e] == 'function') return true;
    });
}

import JsEnv = CS.Puerts.JsEnv;
import FSMState = CS.NodeCanvas.StateMachines.FSMState;

JsEnv.self.UsingFunc($typeof(FSMState), $typeof(CS.System.Boolean));
JsEnv.self.UsingFunc($typeof(CS.System.Object), $typeof(CS.System.Boolean));
