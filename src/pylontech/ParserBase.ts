//const debugApi = Debug("pylontech:api");

import { ConvertValue } from './ConvertValue';
import { IParser } from './IParser';

abstract class ParserBase implements IParser {
  protected _number: number | undefined;
  protected _convertValue: ConvertValue = new ConvertValue();
  protected _noConvertKeys: string[] = [];
  protected _filterKeys: string[] = ['voltage', 'battery', 'power'];

  protected _isParser(data: string, prompt: RegExp, command: string): boolean {
    const cmd: RegExpExecArray | null = prompt.exec(data);
    this._number = cmd !== null ? parseInt(cmd[3]) : undefined;
    return this._number !== undefined && cmd !== null && cmd[2] === command;
  }

  protected _parseDataHeadlineN(data: string, row: RegExp, command: string, identColumn: number): any {
    const head: RegExpExecArray | null = row.exec(data);
    let result: any = {};
    if (head !== null) {
      for (let i: number = 1; i < head.length; i++) {
        head[i] = head[i] ? head[i].trim() : '-X-';
      }
      result[command] = {};
      for (let match: RegExpExecArray | null; (match = row.exec(data)) !== null; ) {
        const dat: any = {};
        for (let i: number = 1; i < match.length; i++) {
          if (match[i]) {
            dat[head[i] !== null ? head[i] : '-X-'] = match[i].trim();
          }
        }
        if (match[identColumn]) {
          result[command][match[identColumn].trim()] = dat;
        }
      }
    }
    if (this._number) {
      const res: any = {};
      res[this._number] = result;
      result = res;
    }
    return this._processDatatypes(result);
  }

  protected _parseDataNameValN(data: string, row: RegExp, command: string): any {
    let result: any = {};
    result = {};
    result[command] = {};
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        result[command][match[1] === '' ? '-X-' : match[1].trim()] = match[2].trim();
      }
    }
    if (this._number) {
      const res: any = {};
      res[this._number] = result;
      result = res;
    }
    return this._processDatatypes(result);
  }

  protected _parseNameValMultiData(data: string, row: RegExp, command: string, indexColum: string): any {
    const result: any = {};
    result[command] = {};
    let index: number = NaN;
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        const col: string = match[1] === '' ? '-X-' : match[1].trim();
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

  protected _processDatatypes(data: any): any {
    const result: any = {};
    Object.keys(data).forEach((key: string) => {
      if (typeof data[key] === 'object') {
        result[key] = this._processDatatypes(data[key]);
      } else {
        const newKey = key.replaceAll('.', '').replaceAll(' ', '_').replaceAll('__', '_').toLowerCase();
        if (data[key] !== '-' && !this._filterKeys.includes(newKey)) {
          result[newKey] = this._convertValue.parseValues(key, data[key], this._noConvertKeys);
        }
      }
    });
    return result;
  }

  abstract isParser(data: string): boolean;

  abstract parseData(data: string): object;

  getParserName(): string {
    return (<any>this).constructor.name;
  }
}
export = ParserBase;
