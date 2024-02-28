"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_promises = require("fs/promises");
var net = __toESM(require("net"));
var import_ConsolenReader = require("../pylontech/ConsolenReader");
const args = process.argv.slice(2);
const host = args[0];
const port = parseInt(args[1]);
const command = args[2];
console.log("arg1:", "host =>", host);
console.log("arg2:", "port =>", port);
console.log("arg3:", "command =>", command);
const portWork = new net.Socket();
portWork.connect(port, host);
const consolenReader = new import_ConsolenReader.ConsolenReader();
portWork.pipe(consolenReader);
consolenReader.on("needsenddata", (data) => {
  portWork.write(data);
});
const file = `${command}.txt`;
(0, import_promises.writeFile)(file, "", { flag: "w+" });
portWork.on("data", function(data) {
  (0, import_promises.writeFile)(file, data, { flag: "a+" });
  console.log("DataRecived\n" + data);
});
portWork.write("\r\n");
portWork.write(command);
portWork.write("\n");
function to(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1e3);
  });
}
to(2).then(() => {
  portWork.end();
});
//# sourceMappingURL=fetchCmdNet.js.map
