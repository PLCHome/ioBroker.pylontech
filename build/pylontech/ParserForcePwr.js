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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ParserForcePwr_exports = {};
__export(ParserForcePwr_exports, {
  ParserForcePwr: () => ParserForcePwr
});
module.exports = __toCommonJS(ParserForcePwr_exports);
var import_ParserBase = __toESM(require("./ParserBase"));
const COMMAND = "pwr";
class ParserForcePwr extends import_ParserBase.default {
  isParser(cmd) {
    const prompt = /(\S+)$/gm;
    return this._isParser(cmd, prompt, COMMAND);
  }
  parseData(data) {
    const rowVal = /(.+\S)\s*:\s(.*)/gm;
    const val = this._parseDataNameValN(data, rowVal, COMMAND);
    const rowTab = /^(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{9})(.{9})(.{9})(.{9})(.{9})(.{16})(.{9})(.{14})(.{21})(.{9})?(.{9})?(.{9})?(.{9})?(.{4,8})?/gm;
    const valtab = this._parseDataHeadlineN(data, rowTab, COMMAND, 0);
    Object.keys(valtab[COMMAND]).forEach((key) => {
      val[COMMAND][key] = valtab[COMMAND][key];
    });
    return val;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ParserForcePwr
});
//# sourceMappingURL=ParserForcePwr.js.map
