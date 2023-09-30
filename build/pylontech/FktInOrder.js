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
var FktInOrder_exports = {};
__export(FktInOrder_exports, {
  FktInOrder: () => FktInOrder
});
module.exports = __toCommonJS(FktInOrder_exports);
class FktInOrder {
  constructor(errLog) {
    this._list = [];
    this._busy = false;
    this._errLog = errLog;
  }
  addFunc(func) {
    if (func) {
      this._list.push(func);
      this.donext();
    }
  }
  doende() {
    this._busy = false;
    clearTimeout(this._timer);
    this.donext();
  }
  donext() {
    if (!this._busy) {
      this._busy = true;
      const func = this._list.pop();
      if (func) {
        new Promise((resolve, reject) => {
          this._timer = setTimeout(() => {
            this.doende();
            reject("order timeout!!!");
          }, 3e4);
          const resolveInt = () => {
            this.doende();
            resolve();
          };
          const rejectInt = (err) => {
            this.doende();
            reject(err);
          };
          func(resolveInt, rejectInt);
        }).catch(this._errLog);
      } else {
        this._busy = false;
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FktInOrder
});
//# sourceMappingURL=FktInOrder.js.map
