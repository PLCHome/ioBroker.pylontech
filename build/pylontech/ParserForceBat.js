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
var ParserForceBat_exports = {};
__export(ParserForceBat_exports, {
  ParserForceBat: () => ParserForceBat
});
module.exports = __toCommonJS(ParserForceBat_exports);
var import_ParserBase = __toESM(require("./ParserBase"));
const COMMAND = "bat";
class ParserForceBat extends import_ParserBase.default {
  isParser(data) {
    const prompt = /(>)(\S+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }
  parseData(data) {
    const rowVal = /(.+\S)\s*:\s(.*)/gm;
    const val = this._parseDataNameValN(data, rowVal, COMMAND);
    const rowTab = /^(.{5})(.{5})(.{8})(.{8})(.{8})(.{8})(.{7})(.{7})(.{8})(.{11})(.{2,3})?/gm;
    const valtab = this._parseDataHeadlineN(data, rowTab, COMMAND, 1);
    Object.keys(valtab[COMMAND]).forEach((key) => {
      val[COMMAND][`battery${(parseInt(key) + 1).toString().padStart(3, "0")}`] = valtab[COMMAND][key];
    });
    return val;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ParserForceBat
});
//# sourceMappingURL=ParserForceBat.js.map
