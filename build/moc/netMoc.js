"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_parser_regex = require("@serialport/parser-regex");
var import_promises = require("fs/promises");
var net = __toESM(require("net"));
const args = process.argv.slice(2);
const host = args[0];
const port = parseInt(args[1]);
const typ = args[2];
console.log("arg1:", "host =>", host);
console.log("arg2:", "port =>", port);
console.log("arg3:", "typ =>", typ);
const portWork = new net.Socket();
portWork.connect(port, host);
const parser = portWork.pipe(new import_parser_regex.RegexParser({ regex: /[\r\n]+/ }));
parser.on("data", function(data) {
  (0, import_promises.readFile)(`data/${typ}/${data}.txt`).then((data2) => {
    portWork.write(data2.toString());
  }).catch((err) => {
    console.log("File fehler", err);
  });
  console.log("Pack received:\n" + data);
});
portWork.setKeepAlive(true, 1e3);
//# sourceMappingURL=netMoc.js.map
