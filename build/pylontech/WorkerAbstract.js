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
var import_ConsolenReader = require("./ConsolenReader");
var import_Parsers = require("./Parsers");
var import_Value = require("./Value");
const debugApi = (0, import_debug.default)("pylontech:api");
const PWR = "pwr";
const POWER = "power";
const STAT = "stat";
const STATISTIC = "statistic";
const BAT = "bat";
const SOH = "soh";
const INFO = "info";
class WorkerAbstract {
  constructor() {
    this._consolenReader = new import_ConsolenReader.ConsolenReader();
    this._commands = [];
    this._timeout = 5e3;
    this._started = false;
    this._parser = new import_Parsers.Parsers();
    debugApi("MyWorkerAbstract.constructor");
    this._consolenReader.on("data", this._onData.bind(this));
    this._consolenReader.on("needsenddata", this.sendData.bind(this));
  }
  _onData(data) {
    const dataString = data.toString();
    debugApi("MyWorkerAbstract._onData", "data:", dataString, "this._activeCmd:", this._activeCmd);
    const parser = this._parser.getParser(dataString);
    let result = {};
    if (parser !== void 0) {
      result = parser.parseData(dataString);
    }
    if (this._activeCmd) {
      clearTimeout(this._activeCmd.timeout);
      this._activeCmd.resolve(result);
      this._activeCmd = void 0;
    }
    this._nextcommand();
  }
  _nextcommand() {
    debugApi("MyWorkerAbstract._nextcommand", "this._activeCmd:", this._activeCmd, "this._started:", this._started);
    if (!this._activeCmd && this._started) {
      this._activeCmd = this._commands.shift();
      if (this._activeCmd) {
        this.sendData(this._activeCmd.cmd + "\r");
        this._activeCmd.timeout = setTimeout(this._ontimeout.bind(this), this._timeout);
      }
    }
  }
  _ontimeout() {
    debugApi("MyWorkerAbstract._ontimeout", "this._activeCmd:", this._activeCmd);
    if (this._activeCmd) {
      this._activeCmd.reject(new Error("timeout"));
      this._activeCmd = void 0;
      this._consolenReader._flush(() => {
        this._nextcommand();
      });
    }
  }
  _connected() {
    debugApi("MyWorkerAbstract._connected", "this._activeCmd:", this._activeCmd);
    this.sendData("\r\n");
    this._started = true;
    this._nextcommand();
  }
  sendCommand(cmd) {
    debugApi("MyWorkerAbstract.sendCommand", "cmd:", cmd);
    return new Promise((resolve, reject) => {
      this._commands.push({ cmd, resolve, reject, timeout: void 0 });
      this._nextcommand();
    });
  }
  async _getAlldata(batteries, cmd) {
    return new Promise((resolve, reject) => {
      const promises = [];
      batteries.forEach((bat) => {
        promises.push(this.sendCommand(`${cmd} ${bat}`));
      });
      Promise.all(promises).then((vals) => {
        let all = {};
        vals.forEach((val) => {
          all = Object.assign(all, val);
        });
        resolve(all);
      }).catch(reject);
    });
  }
  async _getPwr() {
    return new Promise((resolve, reject) => {
      this.sendCommand(PWR).then((pwrs) => {
        const batteries = [];
        if (pwrs && pwrs.pwr) {
          const pwr = pwrs.pwr;
          Object.keys(pwr).forEach((key) => {
            const pwrVal = pwr[key];
            if (pwrVal.basest instanceof import_Value.Value) {
              const pwrBase = pwrVal.basest;
              if (pwrBase.value !== "Absent") {
                batteries.push(key);
              }
            }
          });
        }
        resolve({ pwrs, batteries });
      }).catch(reject);
    });
  }
  async _getinfo(p, info, power) {
    return new Promise((resolve, reject) => {
      this._getAlldata(p.batteries, INFO).then((infos) => {
        const allData = {};
        const batterienames = {};
        Object.keys(infos).forEach((key) => {
          if (infos[key].info && infos[key].info.barcode && infos[key].info.barcode instanceof import_Value.Value) {
            batterienames[key] = infos[key].info.barcode.value;
            if (info) {
              allData[infos[key].info.barcode.value] = infos[key];
              delete allData[infos[key].info.barcode.value].info.barcode;
            }
          }
        });
        p.batteries.forEach((bat) => {
          if (batterienames[bat]) {
            if (power) {
              allData[batterienames[bat]].power = allData[batterienames[bat]].power ? Object.assign(allData[batterienames[bat]].power, p.pwrs.pwr[bat]) : p.pwrs.pwr[bat];
            }
            if (!allData.info)
              allData.info = {};
            allData.info[`${bat}`] = {
              barcode: new import_Value.Value(batterienames[bat], "string", "", "Barcode"),
              connected: new import_Value.Value(true, "boolean", "", "Connected")
            };
          }
        });
        resolve({ batteries: p.batteries, batterienames, allData });
      }).catch(reject);
    });
  }
  async _getNormal(p, what, to, process) {
    return new Promise((resolve, reject) => {
      if (process) {
        this._getAlldata(p.batteries, what).then((data) => {
          Object.keys(data).forEach((key) => {
            if (p.batterienames[key] && p.allData[p.batterienames[key]] && data[key][what]) {
              p.allData[p.batterienames[key]][to] = p.allData[p.batterienames[key]][to] ? Object.assign(p.allData[p.batterienames[key]].power, data[key][what]) : data[key][what];
            }
          });
          resolve(p);
        }).catch(reject);
      } else {
        resolve(p);
      }
    });
  }
  async _getBatterie(p, what, process) {
    return new Promise((resolve, reject) => {
      if (process) {
        this._getAlldata(p.batteries, what).then((data) => {
          Object.keys(data).forEach((key) => {
            if (p.batterienames[key] && data[key][what]) {
              Object.keys(data[key][what]).forEach((batnr) => {
                const batkey = `battery${(parseInt(batnr, 10) + 1).toString().padStart(2, "0")}`;
                p.allData[p.batterienames[key]][batkey] = p.allData[p.batterienames[key]][batkey] ? Object.assign(p.allData[p.batterienames[key]][batkey], data[key][what][batnr]) : data[key][what][batnr];
              });
            }
          });
          resolve(p);
        }).catch(reject);
      } else {
        resolve(p);
      }
    });
  }
  async _getLog(allData, what, process) {
    return new Promise((resolve, reject) => {
      if (process) {
        this.sendCommand(what).then((data) => {
          if (data[what]) {
            allData[what] = data[what];
          }
          resolve(allData);
        }).catch(reject);
      } else {
        resolve(allData);
      }
    });
  }
  async getData(option) {
    if (typeof option.info == "undefined")
      option.info = true;
    if (typeof option.power == "undefined")
      option.power = true;
    if (typeof option.statistic == "undefined")
      option.statistic = true;
    if (typeof option.celldata == "undefined")
      option.celldata = true;
    if (typeof option.cellsoh == "undefined")
      option.cellsoh = true;
    if (typeof option.log == "undefined")
      option.log = true;
    return new Promise((resolve, reject) => {
      this._getPwr().then((p) => {
        this._getinfo(p, option.info, option.power).then((p2) => {
          this._getNormal(p2, PWR, POWER, option.power).then((p3) => {
            this._getNormal(p3, STAT, STATISTIC, option.statistic).then((p4) => {
              this._getBatterie(p4, BAT, option.celldata).then((p5) => {
                this._getBatterie(p5, SOH, option.cellsoh).then((p6) => {
                  this._getLog(p6.allData, "log", option.log).then((allData) => {
                    this._getLog(allData, "time", option.log).then((allData2) => {
                      resolve(allData2);
                    }).catch(reject);
                  }).catch(reject);
                }).catch(reject);
              }).catch(reject);
            }).catch(reject);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }
}
module.exports = WorkerAbstract;
//# sourceMappingURL=WorkerAbstract.js.map
