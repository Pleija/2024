export const bindClass = global.bindClass = function bindClass<T>(csObj: T, ...targetClass: any[]): T {
    let result = csObj;
    let cp = Object.getPrototypeOf(result);
    targetClass.forEach(value => {
        let cls = value.prototype;
        //let newClass = targetClass.toString().replace(/extends\s+.+?\{/g, "{\nconstructor(){ }");
        let newClass = targetClass.toString().replace(/extends\s+.+?\{/g, "{\n").replace('super(...arguments);', "");
        console.log(newClass);
        let tmp = eval(`new ${newClass}`);
        Reflect.ownKeys(tmp).forEach(k => {
            console.log(k, ' = ', tmp[k]);
            cp[k] = tmp[k];
            console.log("[reset value]", k);
        });
        let tp = Object.getPrototypeOf(tmp);

        Object.getOwnPropertyNames(tp).forEach(k => {
            console.log("[reset method]", k);
            result[k] = cls[k];
        });
    })

    return result;
}