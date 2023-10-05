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
var import_FktInOrder = require("./pylontech/FktInOrder");
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
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this._onUnload.bind(this));
  }
  async onReady() {
    this.setState("info.connection", false, true);
    this.subscribeStates("*");
    this._fktInOrder = new import_FktInOrder.FktInOrder(this.log.error);
    if (typeof this.config.connection == "undefined")
      this.config.connection = "1";
    if (typeof this.config.baudrate == "undefined")
      this.config.baudrate = 115200;
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
    if (typeof this.config.time == "undefined")
      this.config.time = true;
    if (typeof this.config.cycle == "undefined")
      this.config.cycle = 5;
    if (typeof this.config.model == "undefined")
      this.config.model = "US";
    if (typeof this.config.sysinfo == "undefined")
      this.config.sysinfo = true;
    if (typeof this.config.unit == "undefined")
      this.config.unit = true;
    this._fktInOrder.addFunc(this._onTimer.bind(this));
    this._workTimer = this.setInterval(() => {
      if (this._fktInOrder)
        this._fktInOrder.addFunc(this._onTimer.bind(this));
    }, this.config.cycle * 6e4);
  }
  _debugData(data) {
    this.log.silly(data.toString());
  }
  _onTimer(resolve, reject) {
    try {
      const worker = this.config.connection == "1" ? new import_WorkerSerial.default(this.config.device, this.config.baudrate, this.config.model, false, this._debugData.bind(this)) : new import_WorkerNet.default(this.config.host, this.config.port, this.config.model, false, this._debugData.bind(this));
      worker.open().then(
        (() => {
          return worker.getData({
            info: this.config.info,
            power: this.config.power,
            statistic: this.config.statistic,
            celldata: this.config.celldata,
            cellsoh: this.config.cellsoh,
            log: this.config.log,
            time: this.config.time
          });
        }).bind(this)
      ).then((allData) => {
        worker.close();
        this.setState("info.connection", true, true);
        resolve();
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
          } else if (typeof val == "object") {
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
            if (!(allData.info && allData.info[info[3]] && allData.info[info[3]].connected)) {
              this.setStateAsync(path, false, true);
            }
          });
        });
      }).catch((err) => {
        worker.close();
        reject(err);
      });
    } catch (e) {
      reject(e.message);
    }
  }
  _setTime(time, cb) {
    const d = new Date(time);
    if (this._fktInOrder) {
      this._fktInOrder.addFunc((resolve, reject) => {
        try {
          let f22 = function(val) {
            return val.toString().padStart(2, "0");
          };
          var f2 = f22;
          const worker = this.config.connection == "1" ? new import_WorkerSerial.default(this.config.device, this.config.baudrate, this.config.model, false, this._debugData.bind(this)) : new import_WorkerNet.default(this.config.host, this.config.port, this.config.model, false, this._debugData.bind(this));
          const cmd = `time ${f22(d.getFullYear() % 100)} ${f22(d.getMonth() + 1)} ${f22(d.getDate())} ${f22(d.getHours())} ${f22(d.getMinutes())} ${f22(
            d.getSeconds()
          )}`;
          worker.open().then(() => {
            return worker.sendCommand(cmd);
          }).then(() => {
            worker.close();
            resolve();
            if (cb)
              cb(true);
          }).catch((err) => {
            worker.close();
            reject(err);
            if (cb)
              cb(false);
          });
        } catch (e) {
          reject(e.message);
          if (cb)
            cb(false);
        }
      });
    }
  }
  _setSpeed(cb) {
    if (this._fktInOrder) {
      this._fktInOrder.addFunc((resolve, reject) => {
        try {
          const worker = this.config.connection == "1" ? new import_WorkerSerial.default(this.config.device, this.config.baudrate, this.config.model, true, this._debugData.bind(this)) : new import_WorkerNet.default(this.config.host, this.config.port, this.config.model, true, this._debugData.bind(this));
          worker.open().then(() => {
            return worker.sendSpeedInit();
          }).then(() => {
            worker.close();
            resolve();
            if (cb)
              cb(true);
          }).catch((err) => {
            worker.close();
            reject(err);
            if (cb)
              cb(false);
          });
        } catch (e) {
          reject(e.message);
          if (cb)
            cb(false);
        }
      });
    }
  }
  _onUnload(callback) {
    try {
      this.clearInterval(this._workTimer);
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state && state.ack == false) {
      this.getObjectAsync(id).then((obj) => {
        if (obj && obj.common.write && obj.native.function) {
          this.log.debug(obj.native.function);
          switch (obj.native.function) {
            case "settime":
              if (typeof state.val == "number")
                this._setTime(state.val);
              break;
            case "akttime":
              if (state.val)
                this._setTime(new Date().getTime(), (ok) => {
                  this.setStateAsync(id, ok, true);
                });
              break;
            case "setspeed115200":
              this._setSpeed((ok) => {
                this.setStateAsync(id, ok, true);
              });
              break;
          }
        }
      });
    }
  }
  onMessage(obj) {
    this.log.debug(JSON.stringify(obj));
    let wait = false;
    if (typeof obj === "object" && obj.message) {
      switch (obj.command) {
        case "getDevices":
          wait = false;
          import_serialport.SerialPort.list().then((port) => {
            const ports = [];
            port.forEach((p) => {
              ports.push(p.path);
            });
            obj.message = JSON.stringify(ports);
          });
          break;
        default:
          obj.message = `Unknown command: ${obj.command}`;
          this.log.warn(obj.message);
          return;
      }
    }
    if (!wait && obj.callback) {
      this.sendTo(obj.from, obj.command, obj.message, obj.callback);
    }
    return;
  }
}
if (require.main !== module) {
  module.exports = (options) => new Pylontech(options);
} else {
  (() => new Pylontech())();
}
//# sourceMappingURL=pylontechMain.js.map
