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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_Value = require("./pylontech/Value");
var import_WorkerSerial = __toESM(require("./pylontech/WorkerSerial"));
var import_promises = __toESM(require("fs/promises"));
const worker = new import_WorkerSerial.default("com7", 115200);
import_promises.default.writeFile("./elements", "", { flag: "w+" });
worker.getData({ info: true, power: true, statistic: true, celldata: true, cellsoh: true }).then((allData) => {
  console.log(JSON.stringify(allData, null, " "));
  function walk(path, val) {
    if (val instanceof import_Value.Value) {
      import_promises.default.writeFile("./elements", path + "	" + val.value + "\n", { flag: "a+" });
      console.log(path + "	" + val.value);
    } else {
      Object.keys(val).forEach((key) => {
        walk(`${path}.${key}`, val[key]);
      });
    }
  }
  walk("pylontech.0", allData);
});
function to(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1e3);
  });
}
to(30).then(() => {
  return worker.close();
});
//# sourceMappingURL=test.js.map
