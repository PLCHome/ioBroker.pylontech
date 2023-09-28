"use strict";
var import_ConvertValue = require("./ConvertValue");
class ParserBase {
  constructor() {
    this._convertValue = new import_ConvertValue.ConvertValue();
    this._noConvertKeys = [];
    this._filterKeys = ["voltage", "battery", "power"];
  }
  _isParser(data, prompt, command) {
    const cmd = prompt.exec(data);
    this._number = cmd !== null ? parseInt(cmd[3]) : void 0;
    return this._number !== void 0 && cmd !== null && cmd[2] === command;
  }
  _parseDataHeadlineN(data, row, command, identColumn) {
    const head = row.exec(data);
    let result = {};
    if (head !== null) {
      for (let i = 1; i < head.length; i++) {
        head[i] = head[i] ? head[i].trim() : "-X-";
      }
      result[command] = {};
      for (let match; (match = row.exec(data)) !== null; ) {
        const dat = {};
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            dat[head[i] !== null ? head[i] : "-X-"] = match[i].trim();
          }
        }
        if (match[identColumn]) {
          result[command][match[identColumn].trim()] = dat;
        }
      }
    }
    if (this._number) {
      const res = {};
      res[this._number] = result;
      result = res;
    }
    return this._processDatatypes(result);
  }
  _parseDataNameValN(data, row, command) {
    let result = {};
    result = {};
    result[command] = {};
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        result[command][match[1] === "" ? "-X-" : match[1].trim()] = match[2].trim();
      }
    }
    if (this._number) {
      const res = {};
      res[this._number] = result;
      result = res;
    }
    return this._processDatatypes(result);
  }
  _parseNameValMultiData(data, row, command, indexColum) {
    const result = {};
    result[command] = {};
    let index = NaN;
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        const col = match[1] === "" ? "-X-" : match[1].trim();
        if (col === indexColum) {
          index = parseInt(match[2]);
          result[command][index] = {};
        }
        if (!isNaN(index)) {
          result[command][index][col] = match[2].trim();
        }
      }
    }
    return this._processDatatypes(result);
  }
  _processDatatypes(data) {
    const result = {};
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "object") {
        result[key] = this._processDatatypes(data[key]);
      } else {
        const newKey = key.replaceAll(".", "").replaceAll(" ", "_").replaceAll("__", "_").toLowerCase();
        if (data[key] !== "-" && !this._filterKeys.includes(newKey)) {
          result[newKey] = this._convertValue.parseValues(key, data[key], this._noConvertKeys);
        }
      }
    });
    return result;
  }
  getParserName() {
    return this.constructor.name;
  }
}
module.exports = ParserBase;
//# sourceMappingURL=ParserBase.js.map
