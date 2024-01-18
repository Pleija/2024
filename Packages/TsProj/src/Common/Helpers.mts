export const bindClass = global.bindClass = function bindClass<T>(component: T, ...classes: any[]): T {
    let result = component;
    let cp = Object.getPrototypeOf(result);
    classes.forEach($class => {
        let cls = $class.prototype;
        //let newClass = targetClass.toString().replace(/extends\s+.+?\{/g, "{\nconstructor(){ }");
        let newClass = $class.toString().replace(/extends\s+.+?\{/g, "{\n").replace('super(...arguments);', "");
        //console.log(newClass);
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
        result[`_${$class.name}_`] = tmp;
    });

    return result;
}