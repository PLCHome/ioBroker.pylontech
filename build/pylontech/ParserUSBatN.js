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
var ParserUSBatN_exports = {};
__export(ParserUSBatN_exports, {
  ParserUSBatN: () => ParserUSBatN
});
module.exports = __toCommonJS(ParserUSBatN_exports);
var import_ParserBase = __toESM(require("./ParserBase"));
const COMMAND = "bat";
class ParserUSBatN extends import_ParserBase.default {
  isParser(cmd) {
    const prompt = /(\S+)\s(\d+)$/gm;
    return this._isParser(cmd, prompt, COMMAND);
  }
  parseData(data) {
    const rowHeadA = /^(B.{8})(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    const rowA = /^(.{9})(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    const rowB = /^(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    if (rowHeadA.exec(data) != null) {
      return this._parseDataHeadlineN(data, rowA, COMMAND, 1);
    } else {
      return this._parseDataHeadlineN(data, rowB, COMMAND, 1);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ParserUSBatN
});
//# sourceMappingURL=ParserUSBatN.js.map
