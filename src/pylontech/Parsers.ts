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

import { debug } from 'debug';
import { IParser } from './IParser';
import { ParserLog } from './ParserLog';
import { ParserTime } from './ParserTime';
import { ParserUSBatN } from './ParserUSBatN';
import { ParserUSInfoN } from './ParserUSInfoN';
import { ParserUSPwr } from './ParserUSPwr';
import { ParserUSPwrN } from './ParserUSPwrN';
import { ParserUSSohN } from './ParserUSSohN';
import { ParserUSStatN } from './ParserUSStatN';

const debugParsers = debug('pylontech:parsers');

export class Parsers {
  protected _parser: IParser[] = [];

  constructor(model: string) {
    debugParsers('Parsers.constructor');
    if (model == 'FORCE') {
    } else {
      this._parser.push(new ParserUSInfoN());
      this._parser.push(new ParserUSPwrN());
      this._parser.push(new ParserUSBatN());
      this._parser.push(new ParserUSSohN());
      this._parser.push(new ParserUSStatN());
      this._parser.push(new ParserUSPwr());
    }
    this._parser.push(new ParserLog());
    this._parser.push(new ParserTime());
  }

  getParser(data: string): IParser | undefined {
    debugParsers('Parsers.getParser', 'data', data);
    let result: IParser | undefined;
    this._parser.forEach(parser => {
      if (parser.isParser(data)) {
        debugParsers('Parsers.getParser', 'parser', parser.getParserName());
        result = parser;
      }
    });
    return result;
  }
}
