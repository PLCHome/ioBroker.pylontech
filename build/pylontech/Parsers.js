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
var import_ParserForceBat = require("./ParserForceBat");
var import_ParserForceBmuinfoN = require("./ParserForceBmuinfoN");
var import_ParserForceInfo = require("./ParserForceInfo");
var import_ParserForcePwr = require("./ParserForcePwr");
var import_ParserForceSoh = require("./ParserForceSoh");
var import_ParserForceStat = require("./ParserForceStat");
var import_ParserForceSysinfo = require("./ParserForceSysinfo");
var import_ParserForceUnit = require("./ParserForceUnit");
var import_ParserLog = require("./ParserLog");
var import_ParserTime = require("./ParserTime");
var import_ParserUSBatN = require("./ParserUSBatN");
var import_ParserUSInfoN = require("./ParserUSInfoN");
var import_ParserUSPwr = require("./ParserUSPwr");
var import_ParserUSPwrN = require("./ParserUSPwrN");
var import_ParserUSSohN = require("./ParserUSSohN");
var import_ParserUSStatN = require("./ParserUSStatN");
const debugParsers = (0, import_debug.debug)("pylontech:parsers");
class Parsers {
  constructor(model) {
    this._parser = [];
    this._cmd = "";
    debugParsers("Parsers.constructor");
    if (model == "FORCE") {
      this._parser.push(new import_ParserForceInfo.ParserForceInfo());
      this._parser.push(new import_ParserForceStat.ParserForceStat());
      this._parser.push(new import_ParserForcePwr.ParserForcePwr());
      this._parser.push(new import_ParserForceUnit.ParserForceUnit());
      this._parser.push(new import_ParserForceBmuinfoN.ParserForceBmuinfoN());
      this._parser.push(new import_ParserForceBat.ParserForceBat());
      this._parser.push(new import_ParserForceSysinfo.ParserForceSysinfo());
      this._parser.push(new import_ParserForceSoh.ParserForceSoh());
    } else {
      this._parser.push(new import_ParserUSInfoN.ParserUSInfoN());
      this._parser.push(new import_ParserUSPwrN.ParserUSPwrN());
      this._parser.push(new import_ParserUSBatN.ParserUSBatN());
      this._parser.push(new import_ParserUSSohN.ParserUSSohN());
      this._parser.push(new import_ParserUSStatN.ParserUSStatN());
      this._parser.push(new import_ParserUSPwr.ParserUSPwr());
    }
    this._parser.push(new import_ParserLog.ParserLog());
    this._parser.push(new import_ParserTime.ParserTime());
  }
  setCMD(cmd) {
    this._cmd = cmd;
  }
  getParser() {
    debugParsers("Parsers.getParser", "this._cmd ", this._cmd);
    let result;
    this._parser.forEach((parser) => {
      if (parser.isParser(this._cmd)) {
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
