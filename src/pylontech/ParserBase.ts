// Copyright (c) 2020-2023 Träger

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import { ConvertValue } from './ConvertValue';
import { IParser } from './IParser';

abstract class ParserBase implements IParser {
  protected _number: number | undefined;
  protected _convertValue: ConvertValue = new ConvertValue();
  protected _noConvertKeys: string[] = [];
  protected _filterKeys: string[] = ['voltage', 'battery', 'power'];

  protected _isParser(cmd: string, prompt: RegExp, command: string): boolean {
    const cmdParsed: RegExpExecArray | null = prompt.exec(cmd);
    this._number = cmdParsed !== null ? parseInt(cmdParsed[2]) : undefined;
    return this._number !== undefined && cmdParsed !== null && cmdParsed[1] === command;
  }

  protected _parseDataHeadlineN(data: string, row: RegExp, command: string, identColumn: number): any {
    const head: RegExpExecArray | null = row.exec(data);
    let result: any = {};
    let lasthead: string = '-X-';
    if (head !== null) {
      for (let i: number = 1; i < head.length; i++) {
        head[i] = !head[i] || head[i].trim() == '' ? `${lasthead}_` : head[i].trim();
        lasthead = head[i];
      }
      result[command] = {};
      for (let match: RegExpExecArray | null; (match = row.exec(data)) !== null; ) {
        const dat: any = {};
        for (let i: number = 1; i < match.length; i++) {
          if (match[i]) {
            dat[head[i] !== null ? head[i] : `${lasthead}_`] = match[i].trim();
            lasthead = head[i];
          }
        }
        if (identColumn > 0) {
          if (match[identColumn]) {
            result[command][match[identColumn].trim()] = dat;
          }
        } else {
          result[command] = dat;
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
    let lasthead: string = '-X-';
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        lasthead = match[1] && match[1].trim() !== '' ? match[1].trim() : `${lasthead}_`;
        result[command][lasthead] = match[2].trim();
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
    let lasthead: string = '-X-';
    for (let match; (match = row.exec(data)) !== null; ) {
      if (match !== null) {
        const col: string = match[1].trim() === '' ? `${lasthead}_` : match[1].trim();
        lasthead = match[1].trim();
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
        const newKey = key.replaceAll('>', '').replaceAll('.', '').replaceAll(' ', '_').replaceAll('__', '_').toLowerCase();
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
