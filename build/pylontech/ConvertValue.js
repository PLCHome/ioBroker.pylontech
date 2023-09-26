"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ConvertValue_exports = {};
__export(ConvertValue_exports, {
  ConvertValue: () => ConvertValue
});
module.exports = __toCommonJS(ConvertValue_exports);
var import_debug = __toESM(require("debug"));
var import_Value = require("./Value");
const debugCVvalue = (0, import_debug.default)("pylontech:cvalue");
class ConvertValue {
  constructor() {
    this._tests = [
      { rex: /^(-|\+)?\d+$/gm, type: "number", unit: "", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*%$/gm, type: "number", unit: "%", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*mAH$/gm, type: "number", unit: "mAH", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*mA$/gm, type: "number", unit: "mA", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*mV$/gm, type: "number", unit: "mV", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*mC$/gm, type: "number", unit: "mC", convert: this._toNumber },
      { rex: /^(-|\+)?\d+\s*s$/gm, type: "number", unit: "s", convert: this._toNumber },
      { rex: /^0x\d+$/gm, type: "number", unit: "", convert: this._HexToNumber },
      {
        rex: /^\d{2}-[01]\d-[0-3]\d [0-2]\d:[0-6]\d:[0-6]\d$/gm,
        type: "date",
        unit: "",
        convert: this._toDateS
      },
      {
        rex: /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-6]\d:[0-6]\d\.\d{3}Z$/gm,
        type: "date",
        unit: "",
        convert: this._toDate
      },
      {
        rex: /^\d{4}-[01]\d-[0-3]\d [0-2]\d:[0-6]\d:[0-6]\d$/gm,
        type: "date",
        unit: "",
        convert: this._toDate
      }
    ];
  }
  _toNumber(str) {
    debugCVvalue("toN_toNumberumber", "str", str);
    return parseInt(str, 10);
  }
  _HexToNumber(str) {
    debugCVvalue("_HexToNumber", "str", str);
    return parseInt(str.substring(2), 16);
  }
  _toDateS(str) {
    debugCVvalue("_toDateS", "str", str);
    return new Date(`20${str}`).getTime();
  }
  _toDate(str) {
    debugCVvalue("_toDate", "str", str);
    return new Date(str).getTime();
  }
  parseValues(key, value, noConvertKeys) {
    const val = value.trim();
    const result = new import_Value.Value(val, "string", "", key);
    if (!noConvertKeys.includes(key)) {
      this._tests.forEach((element) => {
        const rex = new RegExp(element.rex);
        if (rex.test(val)) {
          result.set(element.convert(val), element.type, element.unit, key);
        }
      });
    }
    return result;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConvertValue
});
//# sourceMappingURL=ConvertValue.js.map
