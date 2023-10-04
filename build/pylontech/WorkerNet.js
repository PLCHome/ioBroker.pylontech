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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_debug = __toESM(require("debug"));
var net = __toESM(require("net"));
var import_WorkerAbstract = __toESM(require("./WorkerAbstract"));
const debugApi = (0, import_debug.default)("pylontech:api");
module.exports = class WorkerNet extends import_WorkerAbstract.default {
  constructor(host, port, noPrompt, debugData) {
    debugApi("MyWorkerNet.constructor", "host:", host, "port:", port);
    super();
    this._socket = new net.Socket();
    if (debugData)
      this._socket.on("data", debugData);
    if (noPrompt)
      this._noPrompt = noPrompt;
    this._host = host;
    this._port = port;
    this._socket.pipe(this._consolenReader);
  }
  open() {
    return new Promise(
      ((resolve, reject) => {
        this._socket.on("error", reject);
        this._socket.connect(
          this._port,
          this._host,
          (() => {
            this._connected();
            resolve();
          }).bind(this)
        );
      }).bind(this)
    );
  }
  sendDataB(data) {
    debugApi("MyWorkerNet.sendDataB", "data:", data.toString("hex"), "this._activeCmd:", this._activeCmd);
    this._socket.write(data);
  }
  sendData(data) {
    debugApi("MyWorkerNet.sendData", "data:", data, "this._activeCmd:", this._activeCmd);
    this._socket.write(data);
  }
  close() {
    debugApi("MyWorkerNet.close");
    return new Promise((resolve) => {
      this._socket.end(() => {
        resolve(true);
      });
    });
  }
};
//# sourceMappingURL=WorkerNet.js.map
