import Component = CS.UnityEngine.Component;
import $typeof = puer.$typeof;
import GameObject = CS.UnityEngine.GameObject;
import { iterator } from "Common/Iterator.mjs";
import Array$1 = CS.System.Array$1;

Component.prototype.Get = function <T>(c: new(...args: any[]) => T): T {
    return this.GetComponent($typeof(c));
};
Component.prototype.GetInChildren = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T {
    return this.GetComponentInChildren($typeof(c), invisible);
};
Component.prototype.GetInParent = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T {
    return this.GetComponentInParent($typeof(c), invisible);
};

Component.prototype.GetsInParent = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T[] {
    let result: T[] = [];
    iterator(this.GetComponentsInParent($typeof(c), invisible)).forEach(x => {
        result.push(x);
    });
    return result;
};

Component.prototype.GetsInChildren = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T[] {
    let result: T[] = [];
    iterator(this.GetComponentsInChildren($typeof(c), invisible)).forEach(x => {
        result.push(x);
    });
    return result;
};

GameObject.prototype.Get = function <T>(c: new(...args: any[]) => T): T {
    return this.GetComponent($typeof(c));
};
GameObject.prototype.GetInChildren = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T {
    return this.GetComponentInChildren($typeof(c), invisible);
};
GameObject.prototype.GetInParent = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T {
    return this.GetComponentInParent($typeof(c), invisible);
};

GameObject.prototype.GetsInParent = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T[] {
    let result: T[] = [];
    iterator(this.GetComponentsInParent($typeof(c), invisible)).forEach(x => {
        result.push(x);
    });
    return result;
};

GameObject.prototype.GetsInChildren = function <T>(c: new(...args: any[]) => T, invisible?: boolean): T[] {
    let result: T[] = [];
    iterator(this.GetComponentsInChildren($typeof(c), invisible)).forEach(x => {
        result.push(x);
    });
    return result;
};