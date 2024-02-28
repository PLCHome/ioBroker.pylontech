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
var ConsolenReader_exports = {};
__export(ConsolenReader_exports, {
  ConsolenReader: () => ConsolenReader
});
module.exports = __toCommonJS(ConsolenReader_exports);
var import_debug = __toESM(require("debug"));
var import_stream = require("stream");
const debugApi = (0, import_debug.default)("pylontech:api");
class ConsolenReader extends import_stream.Transform {
  constructor() {
    super({});
    this._buffer = Buffer.alloc(0);
    debugApi("MyParser.constructor");
  }
  _transform(chunk, encoding, cb) {
    debugApi("MyParser._transform", "chunk", chunk.toString("hex"), "encoding", encoding);
    let data = Buffer.concat([this._buffer, chunk]);
    let position;
    let start;
    if ((position = data.lastIndexOf("[Enter]")) !== -1) {
      data.write("-------", position);
      this.emit("needsenddata", "\r");
    }
    while ((position = data.lastIndexOf("$$")) !== -1) {
      if ((start = data.lastIndexOf(">", position)) !== -1) {
        this.push(data.subarray(start, position - 1));
      }
      data = data.subarray(position + 2);
    }
    this._buffer = data;
    cb();
  }
  _flush(cb) {
    debugApi("MyParser._flush");
    this.push(this._buffer);
    this._buffer = Buffer.alloc(0);
    cb();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConsolenReader
});
//# sourceMappingURL=ConsolenReader.js.map
