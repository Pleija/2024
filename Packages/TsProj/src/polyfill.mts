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

import Js = CS.Js;
import FSMState = CS.NodeCanvas.StateMachines.FSMState;

Js.Env.UsingFunc($typeof(FSMState), $typeof(CS.System.Boolean));
Js.Env.UsingFunc($typeof(CS.System.Object), $typeof(CS.System.Boolean));
