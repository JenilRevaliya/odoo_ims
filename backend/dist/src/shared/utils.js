"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramStr = paramStr;
/**
 * Safely extract a single string param from Express 5 params.
 * Express 5 types req.params values as string | string[].
 */
function paramStr(val) {
    if (Array.isArray(val))
        return val[0];
    return val || '';
}
//# sourceMappingURL=utils.js.map