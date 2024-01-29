"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = void 0;
var DefaultLogger = /** @class */ (function () {
    function DefaultLogger(excludeSource) {
        this.excludeSource = excludeSource;
    }
    DefaultLogger.prototype.log = function (source, level, message, error) {
        var args = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            args[_i - 4] = arguments[_i];
        }
        if (!this.excludeSource) {
            args.unshift(source);
        }
        if (error) {
            args.unshift(error);
        }
        switch (level) {
            case "error": {
                console.error(message, args);
                break;
            }
            case "warn": {
                console.warn(message, args);
                break;
            }
            case "debug": {
                console.debug(message, args);
                break;
            }
            case "info": {
                console.info(message, args);
                break;
            }
            case "trace": {
                console.trace(message, args);
                break;
            }
            default: {
                console.log(message, args);
                break;
            }
        }
    };
    return DefaultLogger;
}());
exports.DefaultLogger = DefaultLogger;
