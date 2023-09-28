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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_serialport = require("serialport");
var import_Value = require("./pylontech/Value");
var import_WorkerNet = __toESM(require("./pylontech/WorkerNet"));
var import_WorkerSerial = __toESM(require("./pylontech/WorkerSerial"));
class Pylontech extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "pylontech"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.setState("info.connection", false, true);
    if (typeof this.config.connection == "undefined")
      this.config.connection = "1";
    if (typeof this.config.baudrate == "undefined")
      this.config.baudrate = 115200;
    if (typeof this.config.rfc2217 == "undefined")
      this.config.rfc2217 = false;
    if (typeof this.config.netbaudrate == "undefined")
      this.config.netbaudrate = 115200;
    if (typeof this.config.info == "undefined")
      this.config.info = true;
    if (typeof this.config.power == "undefined")
      this.config.power = true;
    if (typeof this.config.statistic == "undefined")
      this.config.statistic = true;
    if (typeof this.config.celldata == "undefined")
      this.config.celldata = true;
    if (typeof this.config.cellsoh == "undefined")
      this.config.cellsoh = true;
    if (typeof this.config.log == "undefined")
      this.config.log = true;
    if (typeof this.config.cycle == "undefined")
      this.config.cycle = 5;
    this.onTimer();
    this.workTimer = setInterval(this.onTimer.bind(this), this.config.cycle * 6e4);
  }
  onMessage(obj) {
    let wait = false;
    this.log.debug(JSON.stringify(obj));
    if (obj) {
      switch (obj.command) {
        case "getDevices":
          wait = true;
          import_serialport.SerialPort.list().then((port) => {
            const ports = [];
            port.forEach((p) => {
              ports.push(p.path);
            });
            this.sendTo(obj.from, obj.command, JSON.stringify(ports), obj.callback);
          });
          break;
        default:
          this.log.warn(`Unknown command: ${obj.command}`);
          return;
      }
    }
    if (!wait && obj.callback) {
      this.sendTo(obj.from, obj.command, obj.message, obj.callback);
    }
    return;
  }
  onTimer() {
    try {
      const worker = this.config.connection == "1" ? new import_WorkerSerial.default(this.config.device, this.config.baudrate) : new import_WorkerNet.default(this.config.host, this.config.port, this.config.netbaudrate, this.config.rfc2217);
      worker.getData({
        info: this.config.info,
        power: this.config.power,
        statistic: this.config.statistic,
        celldata: this.config.celldata,
        cellsoh: this.config.cellsoh,
        log: this.config.log
      }).then((allData) => {
        worker.close();
        this.setState("info.connection", true, true);
        const walk = async (path, val) => {
          if (val instanceof import_Value.Value) {
            const objdesc = {
              type: "state",
              common: {
                name: val.name,
                type: "number",
                role: "value",
                read: true,
                write: val.write
              },
              native: {}
            };
            if (val.unit)
              objdesc.common.unit = val.unit;
            if (val.function)
              objdesc.native.function = val.function;
            switch (val.type) {
              case "date":
                objdesc.common.role = "value.time";
                break;
              case "boolean":
              case "string":
                objdesc.common.type = val.type;
                break;
            }
            await this.setObjectNotExistsAsync(path, objdesc);
            this.setStateAsync(path, val.value, true);
          } else {
            let p = "";
            if (path !== "")
              p = ".";
            Object.keys(val).forEach((key) => {
              walk(`${path}${p}${key}`, val[key]);
            });
          }
        };
        walk("", allData);
        this.getStatesAsync("info.*.connected").then((state) => {
          Object.keys(state).forEach((path) => {
            const info = path.split(".");
            this.log.info(info[3]);
            this.log.info(
              `${allData.info && allData.info[info[3]] && allData.info[info[3]].connected} ${allData.info && allData.info[info[3]]} ${allData.info}`
            );
            if (!(allData.info && allData.info[info[3]] && allData.info[info[3]].connected)) {
              this.setStateAsync(path, false, true);
            }
          });
        });
      }).catch(this.log.error);
    } catch (e) {
      this.log.error(e.message);
    }
  }
  onUnload(callback) {
    try {
      clearTimeout(this.workTimer);
      callback();
    } catch (e) {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Pylontech(options);
} else {
  (() => new Pylontech())();
}
//# sourceMappingURL=pylontechMain.js.map
