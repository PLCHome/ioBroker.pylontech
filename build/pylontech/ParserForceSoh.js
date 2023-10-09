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
var ParserForceSoh_exports = {};
__export(ParserForceSoh_exports, {
  ParserForceSoh: () => ParserForceSoh
});
module.exports = __toCommonJS(ParserForceSoh_exports);
var import_ParserBase = __toESM(require("./ParserBase"));
const COMMAND = "soh";
class ParserForceSoh extends import_ParserBase.default {
  isParser(cmd) {
    const prompt = /(\S+)$/gm;
    return this._isParser(cmd, prompt, COMMAND);
  }
  parseData(data) {
    const rowVal = /(.+\S)\s*:\s(.*)/gm;
    const val = this._parseDataNameValN(data, rowVal, COMMAND);
    const rowTab = /^(.{11})(.{11})(.{11})(.{9,10})?/gm;
    const valtab = this._parseDataHeadlineN(data, rowTab, COMMAND, 1);
    Object.keys(valtab[COMMAND]).forEach((key) => {
      val[COMMAND][`battery${(parseInt(key) + 1).toString().padStart(3, "0")}`] = valtab[COMMAND][key];
    });
    return val;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ParserForceSoh
});
//# sourceMappingURL=ParserForceSoh.js.map
