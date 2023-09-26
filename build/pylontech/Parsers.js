"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Parsers_exports = {};
__export(Parsers_exports, {
  Parsers: () => Parsers
});
module.exports = __toCommonJS(Parsers_exports);
var import_debug = require("debug");
var import_ParserBatN = require("./ParserBatN");
var import_ParserInfoN = require("./ParserInfoN");
var import_ParserLog = require("./ParserLog");
var import_ParserPwr = require("./ParserPwr");
var import_ParserPwrN = require("./ParserPwrN");
var import_ParserSohN = require("./ParserSohN");
var import_ParserStatN = require("./ParserStatN");
const debugParsers = (0, import_debug.debug)("pylontech:parsers");
class Parsers {
  constructor() {
    this._parser = [];
    debugParsers("Parsers.constructor");
    this._parser.push(new import_ParserInfoN.ParserInfoN());
    this._parser.push(new import_ParserPwrN.ParserPwrN());
    this._parser.push(new import_ParserBatN.ParserBatN());
    this._parser.push(new import_ParserSohN.ParserSohN());
    this._parser.push(new import_ParserStatN.ParserStatN());
    this._parser.push(new import_ParserPwr.ParserPwr());
    this._parser.push(new import_ParserLog.ParserLog());
  }
  getParser(data) {
    debugParsers("Parsers.getParser", "data", data);
    let result;
    this._parser.forEach((parser) => {
      if (parser.isParser(data)) {
        debugParsers("Parsers.getParser", "parser", parser.getParserName());
        result = parser;
      }
    });
    return result;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Parsers
});
//# sourceMappingURL=Parsers.js.map
