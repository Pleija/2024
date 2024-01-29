"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckContraint = void 0;
require("reflect-metadata");
var AbstractEntityMetaData_1 = require("../MetaData/AbstractEntityMetaData");
var CheckConstraintMetaData_1 = require("../MetaData/CheckConstraintMetaData");
var DecoratorKey_1 = require("./DecoratorKey");
function CheckContraint(optionOrCheckOrName, check) {
    var option = {};
    switch (typeof optionOrCheckOrName) {
        case "object":
            option = optionOrCheckOrName;
            break;
        case "function":
            option.check = optionOrCheckOrName;
            break;
        case "string":
            option.name = optionOrCheckOrName;
            break;
    }
    if (check) {
        option.check = check;
    }
    // @ts-ignore
    return function (target, propertyKey) {
        var entConstructor = propertyKey ? target.constructor : target;
        if (!option.name) {
            option.name = "CK_".concat(entConstructor.name, "_").concat((propertyKey ? propertyKey : target.name).toString());
        }
        var entityMetaData = Reflect.getOwnMetadata(DecoratorKey_1.entityMetaKey, entConstructor);
        if (entityMetaData == null) {
            entityMetaData = new AbstractEntityMetaData_1.AbstractEntityMetaData(target.constructor);
        }
        var checkMetaData = entityMetaData.constraints.first(function (o) { return o instanceof CheckConstraintMetaData_1.CheckConstraintMetaData && o.name === option.name; });
        if (checkMetaData) {
            entityMetaData.constraints.delete(checkMetaData);
        }
        checkMetaData = new CheckConstraintMetaData_1.CheckConstraintMetaData(option.name, entityMetaData, option.check);
        entityMetaData.constraints.push(checkMetaData);
        Reflect.defineMetadata(DecoratorKey_1.entityMetaKey, entityMetaData, entConstructor);
    };
}
exports.CheckContraint = CheckContraint;
